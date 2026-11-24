"use server";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const dni = String(formData.get("dni") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !dni || !email || !password) {
    redirect(`/register?error=${encodeURIComponent("Completá todos los campos")}`);
  }
  if (!/^\d{7,8}$/.test(dni)) {
    redirect(`/register?error=${encodeURIComponent("El DNI tiene que tener 7 u 8 números, sin puntos")}`);
  }

  const adminClient = createAdminClient();

  const { error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone, dni },
  });

  if (createError) {
    const lower = createError.message.toLowerCase();
    const message = lower.includes("profiles_dni_key")
      ? "Ese DNI ya está registrado"
      : lower.includes("already been registered") || lower.includes("already registered")
        ? "Ese email ya está registrado"
        : lower.includes("duplicate key") || lower.includes("database error")
          ? "No se pudo crear la cuenta: el DNI o el email ya están registrados"
          : createError.message;
    redirect(`/register?error=${encodeURIComponent(message)}`);
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    redirect(`/register?error=${encodeURIComponent("Cuenta creada, pero no se pudo iniciar sesión. Probá entrar desde /login.")}`);
  }

  redirect("/");
}
