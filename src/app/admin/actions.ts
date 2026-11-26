"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_super_admin) redirect("/");
  return supabase;
}

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, base: string) {
  const { data } = await supabase
    .from("establishments")
    .select("slug")
    .or(`slug.eq.${base},slug.like.${base}-%`);

  const existing = new Set((data ?? []).map((e) => e.slug));
  if (!existing.has(base)) return base;

  let n = 2;
  while (existing.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function createEstablishment(formData: FormData) {
  await requireSuperAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const cancelHoursBefore = Number(formData.get("cancel_hours_before") ?? 4);

  const ownerFullName = String(formData.get("owner_full_name") ?? "").trim();
  const ownerDni = String(formData.get("owner_dni") ?? "").trim();
  const ownerPhone = String(formData.get("owner_phone") ?? "").trim() || null;
  const ownerEmail = String(formData.get("owner_email") ?? "").trim();
  const ownerPassword = String(formData.get("owner_password") ?? "");

  if (!name || !ownerFullName || !ownerDni || !ownerEmail || !ownerPassword) {
    redirect(`/admin/nuevo?error=${encodeURIComponent("Completá todos los campos obligatorios")}`);
  }
  if (!/^\d{7,8}$/.test(ownerDni)) {
    redirect(`/admin/nuevo?error=${encodeURIComponent("El DNI del dueño tiene que tener 7 u 8 números, sin puntos")}`);
  }

  const adminClient = createAdminClient();
  const supabase = await createClient();
  const slug = await uniqueSlug(supabase, slugify(name));

  const { data: created, error: createUserError } = await adminClient.auth.admin.createUser({
    email: ownerEmail,
    password: ownerPassword,
    email_confirm: true,
    user_metadata: { full_name: ownerFullName, phone: ownerPhone, dni: ownerDni },
  });

  if (createUserError || !created.user) {
    const lower = (createUserError?.message ?? "").toLowerCase();
    const message = lower.includes("profiles_dni_key")
      ? "Ese DNI ya está registrado"
      : lower.includes("already been registered") || lower.includes("already registered")
        ? "Ese email ya está registrado"
        : lower.includes("duplicate key") || lower.includes("database error")
          ? "No se pudo crear el dueño: el DNI o el email ya están registrados"
          : (createUserError?.message ?? "No se pudo crear el dueño");
    redirect(`/admin/nuevo?error=${encodeURIComponent(message)}`);
  }

  const ownerId = created.user.id;

  const { data: establishment, error: estError } = await supabase
    .from("establishments")
    .insert({ name, slug, address, phone, cancel_hours_before: cancelHoursBefore })
    .select("id")
    .single();

  if (estError || !establishment) {
    await adminClient.auth.admin.deleteUser(ownerId);
    redirect(`/admin/nuevo?error=${encodeURIComponent(estError?.message ?? "No se pudo crear el establecimiento")}`);
  }

  const { error: memberError } = await supabase
    .from("establishment_members")
    .insert({ establishment_id: establishment.id, user_id: ownerId, role: "owner" });

  if (memberError) {
    redirect(`/admin/nuevo?error=${encodeURIComponent(memberError.message)}`);
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateEstablishment(establishmentId: string, formData: FormData) {
  const supabase = await requireSuperAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const cancelHoursBefore = Number(formData.get("cancel_hours_before") ?? 4);

  const { error } = await supabase
    .from("establishments")
    .update({ name, description, address, phone, cancel_hours_before: cancelHoursBefore })
    .eq("id", establishmentId);

  if (error) {
    redirect(`/admin/${establishmentId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${establishmentId}`);
  redirect(`/admin/${establishmentId}?ok=1`);
}

export async function toggleActive(establishmentId: string, nextActive: boolean) {
  const supabase = await requireSuperAdmin();

  const { error } = await supabase
    .from("establishments")
    .update({ active: nextActive })
    .eq("id", establishmentId);

  if (error) {
    redirect(`/admin/${establishmentId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${establishmentId}`);
}
