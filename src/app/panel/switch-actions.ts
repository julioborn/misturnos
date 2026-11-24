"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACTIVE_EST_COOKIE } from "@/lib/panel/establishment";

export async function switchEstablishment(formData: FormData) {
  const establishmentId = String(formData.get("establishment_id") ?? "");
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_EST_COOKIE, establishmentId, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  redirect("/panel");
}
