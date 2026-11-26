-- =====================================================================
-- App de turnos para canchas (pádel / fútbol) — esquema Supabase
-- Multi-establecimiento. Pago por fuera de la app. Recordatorios por push.
-- Convención de weekday: 0 = domingo ... 6 = sábado (igual que JS getDay()).
-- =====================================================================

create extension if not exists btree_gist;

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type sport_type as enum ('padel', 'futbol');
create type booking_status as enum ('confirmed', 'blocked', 'cancelled', 'no_show', 'completed');
create type booking_source as enum ('app', 'manual');
create type member_role as enum ('owner', 'staff');

-- ---------------------------------------------------------------------
-- Perfiles (1 por usuario de auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  dni text unique,   -- identificador de login (en vez de email)
  email text,         -- copia de auth.users.email, solo para resolver dni -> email al loguear
  is_super_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, dni, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'dni',
    new.email
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Establecimientos (tenants). Los crea y activa/suspende el super admin.
-- Nota: esta sección se movió antes de "Helpers de permisos" porque
-- is_member() (más abajo) es LANGUAGE SQL y Postgres valida sus
-- referencias a tablas en el momento de crear la función, no al usarla
-- (a diferencia de LANGUAGE plpgsql, que las resuelve en forma diferida).
-- ---------------------------------------------------------------------
create table public.establishments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  address text,
  phone text,
  logo_url text,
  photos text[] not null default '{}',
  timezone text not null default 'America/Argentina/Cordoba',
  cancel_hours_before int not null default 4 check (cancel_hours_before >= 0),
  active boolean not null default true,   -- lo controla el super admin (mensualidad)
  created_at timestamptz not null default now()
);

-- El dueño edita su perfil pero no puede activarse/desactivarse solo.
create or replace function public.guard_establishment_update()
returns trigger language plpgsql as $$
begin
  if new.active is distinct from old.active
     and auth.uid() is not null and not public.is_super_admin() then
    raise exception 'Solo el administrador puede activar o suspender un establecimiento';
  end if;
  return new;
end $$;

create trigger establishments_guard before update on public.establishments
  for each row execute function public.guard_establishment_update();

create table public.establishment_members (
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role member_role not null default 'owner',
  primary key (establishment_id, user_id)
);
create index on public.establishment_members (user_id);

-- ---------------------------------------------------------------------
-- Helpers de permisos
-- ---------------------------------------------------------------------
create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_super_admin from public.profiles where id = auth.uid()), false)
$$;

-- true si el usuario es miembro del establecimiento (o super admin).
-- p_owner_only = true exige rol 'owner'.
create or replace function public.is_member(p_est uuid, p_owner_only boolean default false)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_super_admin() or exists (
    select 1 from public.establishment_members m
    where m.establishment_id = p_est
      and m.user_id = auth.uid()
      and (not p_owner_only or m.role = 'owner')
  )
$$;

-- Nadie puede auto-promoverse a super admin desde la app.
create or replace function public.guard_profile_update()
returns trigger language plpgsql as $$
begin
  if new.is_super_admin is distinct from old.is_super_admin
     and auth.uid() is not null and not public.is_super_admin() then
    raise exception 'No autorizado';
  end if;
  return new;
end $$;

create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ---------------------------------------------------------------------
-- Canchas
-- ---------------------------------------------------------------------
create table public.courts (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  name text not null,                          -- "Cancha 1"
  sport sport_type not null,
  variant text,                                -- "F5", "F7" (fútbol), "techada", etc.
  slot_minutes int not null default 90 check (slot_minutes between 15 and 480),
  default_price numeric(10,2) not null default 0,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.courts (establishment_id);

-- Horarios de apertura por día. Se pueden cargar varias franjas por día.
-- Si close_time <= open_time se interpreta que cierra después de medianoche.
create table public.court_hours (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  open_time time not null,
  close_time time not null
);
create index on public.court_hours (court_id, weekday);

-- Reglas de precio por franja. weekday NULL = todos los días.
-- to_time = 00:00 significa "hasta fin del día". Si no hay regla, vale default_price.
-- (Limitación: una regla no cruza medianoche; los turnos después de las 00:00
--  usan la regla que cubra esa hora o default_price.)
create table public.court_prices (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts(id) on delete cascade,
  weekday smallint check (weekday between 0 and 6),
  from_time time not null,
  to_time time not null,
  price numeric(10,2) not null check (price >= 0)
);
create index on public.court_prices (court_id);

-- Canchas que comparten el mismo espacio físico (ej: dos canchas de fútbol 5
-- que, unidas, forman una de fútbol 7). Reservar una bloquea la otra para la
-- misma franja. Se carga simétrica (ambas direcciones) para simplificar los
-- queries de disponibilidad/conflicto.
create table public.court_conflicts (
  court_id uuid not null references public.courts(id) on delete cascade,
  conflicts_with uuid not null references public.courts(id) on delete cascade,
  primary key (court_id, conflicts_with),
  check (court_id <> conflicts_with)
);
create index on public.court_conflicts (conflicts_with);

-- ---------------------------------------------------------------------
-- Reservas y bloqueos (un bloqueo es una reserva con status 'blocked')
-- ---------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,  -- null en reservas manuales/bloqueos
  guest_name text,                       -- copia del nombre al reservar (o nombre cargado a mano)
  guest_phone text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status booking_status not null default 'confirmed',
  source booking_source not null default 'app',
  price numeric(10,2),
  note text,
  reminded_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  -- Imposible tener dos turnos activos superpuestos en la misma cancha.
  constraint bookings_no_overlap exclude using gist (
    court_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status <> 'cancelled')
);
create index on public.bookings (court_id, starts_at);
create index on public.bookings (user_id, starts_at);
create index on public.bookings (establishment_id, starts_at);

-- establishment_id siempre se deriva de la cancha (evita inconsistencias).
create or replace function public.bookings_set_establishment()
returns trigger language plpgsql as $$
begin
  select establishment_id into new.establishment_id from public.courts where id = new.court_id;
  return new;
end $$;

create trigger bookings_set_est before insert or update of court_id on public.bookings
  for each row execute function public.bookings_set_establishment();

-- bookings_no_overlap solo cubre superposición dentro de la MISMA cancha.
-- Esto cubre el caso de canchas que comparten espacio físico (court_conflicts):
-- reservar una debe bloquear la/s otra/s para la misma franja, sin importar
-- si la reserva se crea vía create_booking (jugador) o un insert manual
-- directo del panel (dueño/staff) — por eso vive acá como trigger y no
-- adentro de una sola función.
create or replace function public.bookings_check_conflicts()
returns trigger language plpgsql as $$
declare
  v_lock_key bigint;
begin
  if new.status = 'cancelled' then
    return new;
  end if;

  -- Serializa contra cualquier otra transacción que toque el mismo grupo de
  -- canchas vinculadas + franja horaria, para que el chequeo de abajo no
  -- tenga condición de carrera.
  v_lock_key := hashtextextended(
    (select string_agg(id::text, ',' order by id)
       from (select new.court_id as id
             union
             select conflicts_with from public.court_conflicts where court_id = new.court_id) x)
    || '|' || new.starts_at::text,
    0
  );
  perform pg_advisory_xact_lock(v_lock_key);

  if exists (
    select 1 from public.bookings b
     where b.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
       and b.status <> 'cancelled'
       and b.court_id in (select conflicts_with from public.court_conflicts where court_id = new.court_id)
       and tstzrange(b.starts_at, b.ends_at) && tstzrange(new.starts_at, new.ends_at)
  ) then
    raise exception 'Ese turno ya fue reservado';
  end if;

  return new;
end $$;

create trigger bookings_check_conflicts
  before insert or update of court_id, starts_at, ends_at, status
  on public.bookings
  for each row execute function public.bookings_check_conflicts();

-- Jugadores bloqueados por un establecimiento (p. ej. por ausentes reiterados).
create table public.establishment_player_blocks (
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  primary key (establishment_id, user_id)
);

-- Ausentes por jugador y establecimiento (para decidir bloqueos).
create view public.player_no_shows with (security_invoker = true) as
  select establishment_id, user_id, count(*) as no_shows, max(starts_at) as last_no_show
  from public.bookings
  where status = 'no_show' and user_id is not null
  group by establishment_id, user_id;

-- ---------------------------------------------------------------------
-- Notificaciones (bandeja dentro de la app + envío push)
-- ---------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  data jsonb not null default '{}',
  read_at timestamptz,
  pushed_at timestamptz,                 -- lo marca la Edge Function al enviar el push
  created_at timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc);
create index on public.notifications (pushed_at) where pushed_at is null;

create table public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('android', 'ios', 'web')),
  updated_at timestamptz not null default now()
);
create index on public.device_tokens (user_id);

-- Secretos server-only (ej: cuenta de servicio de Firebase para FCM).
-- Sin policies de RLS: solo el service_role (que bypassea RLS) puede
-- leerla o escribirla. La usa la Edge Function send-push.
create table public.app_secrets (
  id text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.app_secrets enable row level security;

-- ---------------------------------------------------------------------
-- Lógica de negocio
-- ---------------------------------------------------------------------

-- Precio de un turno que empieza en p_local (hora local del establecimiento).
create or replace function public.price_for(p_court uuid, p_local timestamp)
returns numeric language sql stable security definer set search_path = public as $$
  select coalesce(
    (select cp.price
       from public.court_prices cp
      where cp.court_id = p_court
        and (cp.weekday is null or cp.weekday = extract(dow from p_local)::int)
        and p_local::time >= cp.from_time
        and (p_local::time < cp.to_time or cp.to_time = time '00:00')
      order by (cp.weekday is not null) desc, cp.from_time desc
      limit 1),
    (select default_price from public.courts where id = p_court)
  )
$$;

-- Disponibilidad de una cancha para una jornada (día de apertura).
-- Devuelve todos los turnos con is_free, sin exponer datos de otros jugadores.
create or replace function public.get_availability(p_court uuid, p_day date)
returns table (starts_at timestamptz, ends_at timestamptz, is_free boolean, price numeric)
language sql stable security definer set search_path = public as $$
  with c as (
    select co.id, co.slot_minutes, e.timezone as tz
      from public.courts co
      join public.establishments e on e.id = co.establishment_id
     where co.id = p_court and co.active and e.active
  ),
  h as (
    select c.id, c.slot_minutes, c.tz,
           (p_day + ch.open_time) as open_ts,
           (p_day + ch.open_time) + case
              when ch.close_time <= ch.open_time
                then (ch.close_time - ch.open_time) + interval '24 hours'
              else (ch.close_time - ch.open_time)
           end as close_ts
      from c
      join public.court_hours ch
        on ch.court_id = c.id and ch.weekday = extract(dow from p_day)::int
  ),
  s as (
    select h.id as court_id, h.tz,
           gs as s_local,
           gs + make_interval(mins => h.slot_minutes) as e_local
      from h,
           generate_series(h.open_ts,
                           h.close_ts - make_interval(mins => h.slot_minutes),
                           make_interval(mins => h.slot_minutes)) gs
  )
  select (s.s_local at time zone s.tz) as starts_at,
         (s.e_local at time zone s.tz) as ends_at,
         ( (s.s_local at time zone s.tz) > now()
           and not exists (
             select 1 from public.bookings b
              where b.status <> 'cancelled'
                and (
                  b.court_id = s.court_id
                  or b.court_id in (select conflicts_with from public.court_conflicts where court_id = s.court_id)
                )
                and tstzrange(b.starts_at, b.ends_at)
                    && tstzrange(s.s_local at time zone s.tz, s.e_local at time zone s.tz)
           )
         ) as is_free,
         public.price_for(s.court_id, s.s_local) as price
    from s
   order by 1
$$;

-- Reservar un turno (la usa el jugador desde la app).
create or replace function public.create_booking(p_court uuid, p_starts_at timestamptz)
returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  v_user  uuid := auth.uid();
  v_court public.courts;
  v_est   public.establishments;
  v_prof  public.profiles;
  v_end   timestamptz;
  v_local timestamp;
  v_d     date;
  v_row   public.court_hours;
  v_open  timestamp;
  v_close timestamp;
  v_ok    boolean := false;
  v_res   public.bookings;
begin
  if v_user is null then
    raise exception 'Tenés que iniciar sesión' using errcode = '28000';
  end if;

  select * into v_court from public.courts where id = p_court and active;
  if not found then raise exception 'Cancha no disponible'; end if;

  select * into v_est from public.establishments where id = v_court.establishment_id and active;
  if not found then raise exception 'Establecimiento no disponible'; end if;

  if exists (select 1 from public.establishment_player_blocks
              where establishment_id = v_est.id and user_id = v_user) then
    raise exception 'No podés reservar en este establecimiento';
  end if;

  if p_starts_at <= now() then raise exception 'Ese turno ya pasó'; end if;

  v_end   := p_starts_at + make_interval(mins => v_court.slot_minutes);
  v_local := p_starts_at at time zone v_est.timezone;

  -- El turno debe caer dentro de un horario de apertura y alineado a la grilla.
  -- Se prueba la jornada del día local y la del día anterior (cierres después de medianoche).
  foreach v_d in array array[v_local::date, v_local::date - 1] loop
    for v_row in
      select * from public.court_hours
       where court_id = p_court and weekday = extract(dow from v_d)::int
    loop
      v_open  := v_d + v_row.open_time;
      v_close := v_open + case
                   when v_row.close_time <= v_row.open_time
                     then (v_row.close_time - v_row.open_time) + interval '24 hours'
                   else v_row.close_time - v_row.open_time
                 end;
      if v_local >= v_open
         and v_local + make_interval(mins => v_court.slot_minutes) <= v_close
         and mod(extract(epoch from (v_local - v_open))::int, v_court.slot_minutes * 60) = 0 then
        v_ok := true;
      end if;
    end loop;
  end loop;

  if not v_ok then raise exception 'Horario fuera de la grilla de la cancha'; end if;

  select * into v_prof from public.profiles where id = v_user;

  begin
    insert into public.bookings
      (court_id, establishment_id, user_id, guest_name, guest_phone,
       starts_at, ends_at, status, source, price)
    values
      (p_court, v_est.id, v_user, v_prof.full_name, v_prof.phone,
       p_starts_at, v_end, 'confirmed', 'app', public.price_for(p_court, v_local))
    returning * into v_res;
  exception when exclusion_violation then
    raise exception 'Ese turno ya fue reservado';
  end;

  return v_res;
end $$;

-- Cancelar. El jugador solo puede hasta cancel_hours_before; el dueño/staff siempre.
create or replace function public.cancel_booking(p_booking uuid)
returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  v_b   public.bookings;
  v_est public.establishments;
begin
  select * into v_b from public.bookings where id = p_booking for update;
  if not found then raise exception 'Reserva inexistente'; end if;
  if v_b.status not in ('confirmed', 'blocked') then
    raise exception 'La reserva no se puede cancelar';
  end if;

  select * into v_est from public.establishments where id = v_b.establishment_id;

  if public.is_member(v_b.establishment_id) then
    null;  -- dueño / staff / super admin: sin restricción de horas
  elsif v_b.user_id = auth.uid() and v_b.status = 'confirmed' then
    if v_b.starts_at - make_interval(hours => v_est.cancel_hours_before) <= now() then
      raise exception 'Ya no se puede cancelar: el límite es % hs antes del turno', v_est.cancel_hours_before;
    end if;
  else
    raise exception 'No autorizado';
  end if;

  update public.bookings
     set status = 'cancelled', cancelled_at = now()
   where id = p_booking
   returning * into v_b;

  return v_b;
end $$;

-- Marcar ausente (solo dueño/staff, una vez iniciado el turno).
create or replace function public.mark_no_show(p_booking uuid)
returns public.bookings
language plpgsql security definer set search_path = public as $$
declare v_b public.bookings;
begin
  select * into v_b from public.bookings where id = p_booking for update;
  if not found then raise exception 'Reserva inexistente'; end if;
  if not public.is_member(v_b.establishment_id) then raise exception 'No autorizado'; end if;
  if v_b.status <> 'confirmed' then raise exception 'Solo se puede marcar una reserva confirmada'; end if;
  if v_b.starts_at > now() then raise exception 'El turno todavía no empezó'; end if;

  update public.bookings set status = 'no_show' where id = p_booking returning * into v_b;
  return v_b;
end $$;

-- Genera notificaciones de recordatorio (entre 2 y 24 hs antes del turno).
-- Programar cada 15 minutos con pg_cron:
--   select cron.schedule('recordatorios', '*/15 * * * *', 'select public.enqueue_reminders()');
-- Una Edge Function toma las notificaciones con pushed_at is null y envía el push (FCM/APNs).
create or replace function public.enqueue_reminders()
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  with due as (
    update public.bookings b
       set reminded_at = now()
     where b.status = 'confirmed'
       and b.user_id is not null
       and b.reminded_at is null
       and b.starts_at between now() + interval '2 hours' and now() + interval '24 hours'
    returning b.id, b.user_id, b.starts_at, b.court_id, b.establishment_id
  ), ins as (
    insert into public.notifications (user_id, title, body, data)
    select d.user_id,
           'Recordatorio de turno',
           'Tenés turno en ' || e.name || ' (' || c.name || ') a las '
             || to_char(d.starts_at at time zone e.timezone, 'HH24:MI')
             || '. Si no podés ir, cancelalo desde la app.',
           jsonb_build_object('booking_id', d.id, 'type', 'reminder')
      from due d
      join public.courts c on c.id = d.court_id
      join public.establishments e on e.id = d.establishment_id
    returning 1
  )
  select count(*) into n from ins;
  return n;
end $$;

-- ---------------------------------------------------------------------
-- Permisos de ejecución
-- ---------------------------------------------------------------------
revoke execute on function public.create_booking(uuid, timestamptz) from public, anon;
revoke execute on function public.cancel_booking(uuid) from public, anon;
revoke execute on function public.mark_no_show(uuid) from public, anon;
revoke execute on function public.enqueue_reminders() from public, anon, authenticated;
grant execute on function public.create_booking(uuid, timestamptz) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
grant execute on function public.mark_no_show(uuid) to authenticated;
grant execute on function public.get_availability(uuid, date) to anon, authenticated;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.profiles                    enable row level security;
alter table public.establishments              enable row level security;
alter table public.establishment_members       enable row level security;
alter table public.courts                      enable row level security;
alter table public.court_hours                 enable row level security;
alter table public.court_prices                enable row level security;
alter table public.court_conflicts             enable row level security;
alter table public.bookings                    enable row level security;
alter table public.establishment_player_blocks enable row level security;
alter table public.notifications               enable row level security;
alter table public.device_tokens               enable row level security;

-- profiles
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_super_admin());
create policy profiles_update on public.profiles for update
  using (id = auth.uid() or public.is_super_admin())
  with check (id = auth.uid() or public.is_super_admin());

-- establishments: el público ve los activos
create policy est_select on public.establishments for select
  using (active or public.is_member(id));
create policy est_insert on public.establishments for insert
  with check (public.is_super_admin());
create policy est_update on public.establishments for update
  using (public.is_member(id, true)) with check (public.is_member(id, true));
create policy est_delete on public.establishments for delete
  using (public.is_super_admin());

-- members
create policy members_select on public.establishment_members for select
  using (user_id = auth.uid() or public.is_member(establishment_id, true));
-- el super admin controla todo (incluye asignar/editar dueños).
create policy members_write on public.establishment_members for all
  using (public.is_super_admin()) with check (public.is_super_admin());
-- el dueño puede sumar/sacar su propio staff, pero no tocar filas de dueño.
create policy members_owner_insert_staff on public.establishment_members for insert
  with check (public.is_member(establishment_id, true) and role = 'staff');
create policy members_owner_delete_staff on public.establishment_members for delete
  using (public.is_member(establishment_id, true) and role = 'staff');

-- courts
create policy courts_select on public.courts for select
  using (
    exists (select 1 from public.establishments e where e.id = establishment_id and e.active)
    or public.is_member(establishment_id)
  );
create policy courts_write on public.courts for all
  using (public.is_member(establishment_id, true))
  with check (public.is_member(establishment_id, true));

-- court_hours
create policy hours_select on public.court_hours for select
  using (exists (select 1 from public.courts c where c.id = court_id));
create policy hours_write on public.court_hours for all
  using (exists (select 1 from public.courts c
                  where c.id = court_id and public.is_member(c.establishment_id, true)))
  with check (exists (select 1 from public.courts c
                       where c.id = court_id and public.is_member(c.establishment_id, true)));

-- court_prices
create policy prices_select on public.court_prices for select
  using (exists (select 1 from public.courts c where c.id = court_id));
create policy prices_write on public.court_prices for all
  using (exists (select 1 from public.courts c
                  where c.id = court_id and public.is_member(c.establishment_id, true)))
  with check (exists (select 1 from public.courts c
                       where c.id = court_id and public.is_member(c.establishment_id, true)));

-- court_conflicts
create policy conflicts_select on public.court_conflicts for select
  using (exists (select 1 from public.courts c where c.id = court_id));
create policy conflicts_write on public.court_conflicts for all
  using (exists (select 1 from public.courts c
                  where c.id = court_id and public.is_member(c.establishment_id, true)))
  with check (exists (select 1 from public.courts c
                       where c.id = court_id and public.is_member(c.establishment_id, true)));

-- bookings: el jugador ve las suyas; el dueño/staff ven todas las de su establecimiento.
-- Los jugadores reservan y cancelan SOLO vía create_booking / cancel_booking.
create policy bookings_select on public.bookings for select
  using (user_id = auth.uid() or public.is_member(establishment_id));
create policy bookings_insert_manual on public.bookings for insert
  with check (
    public.is_member(establishment_id)
    and source = 'manual' and user_id is null
    and status in ('confirmed', 'blocked')
  );
create policy bookings_update_staff on public.bookings for update
  using (public.is_member(establishment_id))
  with check (public.is_member(establishment_id));

-- bloqueos de jugadores
create policy pblocks_all on public.establishment_player_blocks for all
  using (public.is_member(establishment_id))
  with check (public.is_member(establishment_id));

-- notificaciones y tokens: cada usuario las suyas
create policy notif_select on public.notifications for select using (user_id = auth.uid());
create policy notif_update on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tokens_all on public.device_tokens for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Cron: recordatorios + push (requiere pg_cron y pg_net)
-- NOTA: no pegar la service_role key real acá — este archivo se commitea.
-- La migración real aplicada al proyecto tiene la key embebida en el
-- job de pg_cron (vive en Postgres, nunca en git).
-- ---------------------------------------------------------------------
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'enqueue-reminders',
  '*/15 * * * *',
  $$select public.enqueue_reminders();$$
);

select cron.schedule(
  'send-push-notifications',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://tostjnvhhekxybwsdawk.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <SUPABASE_SERVICE_ROLE_KEY>',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
