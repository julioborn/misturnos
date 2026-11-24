"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveEstablishment } from "@/lib/panel/establishment";
import { utcToLocal } from "@/lib/time/argentina";

function backToAgenda(courtId: string, startsAt: string) {
  const date = utcToLocal(new Date(startsAt)).date;
  redirect(`/panel?court=${courtId}&date=${date}`);
}

export async function createManualBooking(
  courtId: string,
  startsAt: string,
  endsAt: string,
  price: number,
  formData: FormData,
) {
  const { establishment } = await getActiveEstablishment();
  if (!establishment) redirect("/panel");

  const guestName = String(formData.get("guest_name") ?? "").trim();
  const guestPhone = String(formData.get("guest_phone") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!guestName) {
    redirect(
      `/panel/turnos/nuevo?court=${courtId}&starts_at=${encodeURIComponent(startsAt)}&ends_at=${encodeURIComponent(endsAt)}&price=${price}&mode=manual&error=${encodeURIComponent("Ingresá el nombre")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("bookings").insert({
    court_id: courtId,
    establishment_id: establishment.id,
    starts_at: startsAt,
    ends_at: endsAt,
    status: "confirmed",
    source: "manual",
    user_id: null,
    guest_name: guestName,
    guest_phone: guestPhone,
    note,
    price,
  });

  if (error) {
    redirect(
      `/panel/turnos/nuevo?court=${courtId}&starts_at=${encodeURIComponent(startsAt)}&ends_at=${encodeURIComponent(endsAt)}&price=${price}&mode=manual&error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/panel");
  backToAgenda(courtId, startsAt);
}

export async function blockSlot(courtId: string, startsAt: string, endsAt: string, formData: FormData) {
  const { establishment } = await getActiveEstablishment();
  if (!establishment) redirect("/panel");

  const note = String(formData.get("note") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("bookings").insert({
    court_id: courtId,
    establishment_id: establishment.id,
    starts_at: startsAt,
    ends_at: endsAt,
    status: "blocked",
    source: "manual",
    user_id: null,
    note,
  });

  if (error) {
    redirect(
      `/panel/turnos/nuevo?court=${courtId}&starts_at=${encodeURIComponent(startsAt)}&ends_at=${encodeURIComponent(endsAt)}&price=0&mode=block&error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/panel");
  backToAgenda(courtId, startsAt);
}

export async function cancelBooking(courtId: string, startsAt: string, bookingId: string) {
  const supabase = await createClient();
  await supabase.rpc("cancel_booking", { p_booking: bookingId });
  revalidatePath("/panel");
  backToAgenda(courtId, startsAt);
}

export async function markNoShow(courtId: string, startsAt: string, bookingId: string) {
  const supabase = await createClient();
  await supabase.rpc("mark_no_show", { p_booking: bookingId });
  revalidatePath("/panel");
  backToAgenda(courtId, startsAt);
}
