"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getActiveEstablishment } from "@/lib/panel/establishment";

export async function createStaffMember(formData: FormData) {
  const { establishment, role } = await getActiveEstablishment();
  if (!establishment || role !== "owner") redirect("/panel");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const dni = String(formData.get("dni") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !dni || !email || !password) {
    redirect(`/panel/staff?error=${encodeURIComponent("Completá todos los campos obligatorios")}`);
  }
  if (!/^\d{7,8}$/.test(dni)) {
    redirect(`/panel/staff?error=${encodeURIComponent("El DNI tiene que tener 7 u 8 números, sin puntos")}`);
  }

  const adminClient = createAdminClient();
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone, dni },
  });

  if (createError || !created.user) {
    const lower = (createError?.message ?? "").toLowerCase();
    const message = lower.includes("profiles_dni_key")
      ? "Ese DNI ya está registrado"
      : lower.includes("already been registered") || lower.includes("already registered")
        ? "Ese email ya está registrado"
        : lower.includes("duplicate key") || lower.includes("database error")
          ? "No se pudo crear el staff: el DNI o el email ya están registrados"
          : (createError?.message ?? "No se pudo crear el staff");
    redirect(`/panel/staff?error=${encodeURIComponent(message)}`);
  }

  const supabase = await createClient();
  const { error: memberError } = await supabase
    .from("establishment_members")
    .insert({ establishment_id: establishment.id, user_id: created.user.id, role: "staff" });

  if (memberError) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    redirect(`/panel/staff?error=${encodeURIComponent(memberError.message)}`);
  }

  revalidatePath("/panel/staff");
  redirect("/panel/staff");
}

export async function removeStaffMember(userId: string) {
  const { establishment, role } = await getActiveEstablishment();
  if (!establishment || role !== "owner") redirect("/panel");

  const supabase = await createClient();
  await supabase
    .from("establishment_members")
    .delete()
    .eq("establishment_id", establishment.id)
    .eq("user_id", userId)
    .eq("role", "staff");

  revalidatePath("/panel/staff");
}
