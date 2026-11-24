"use server";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const dni = String(formData.get("dni") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  const fail = () =>
    redirect(`/login?error=${encodeURIComponent("DNI o contraseña incorrectos")}&next=${encodeURIComponent(next)}`);

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("email")
    .eq("dni", dni)
    .maybeSingle();

  if (!profile?.email) fail();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: profile!.email!, password });

  if (error) fail();

  redirect(next);
}
