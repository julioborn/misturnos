"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveEstablishment } from "@/lib/panel/establishment";
import { uploadEstablishmentPhotoFile } from "@/lib/storage/establishment-photo";

export async function updateEstablishmentProfile(formData: FormData) {
  const { establishment, role } = await getActiveEstablishment();
  if (!establishment || role !== "owner") redirect("/panel");

  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const cancelHoursBefore = Number(formData.get("cancel_hours_before") ?? 4);

  const { error } = await supabase
    .from("establishments")
    .update({ name, description, address, phone, cancel_hours_before: cancelHoursBefore })
    .eq("id", establishment.id);

  if (error) {
    redirect(`/panel/configuracion?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/panel/configuracion");
  redirect("/panel/configuracion?ok=1");
}

export async function uploadEstablishmentPhoto(formData: FormData) {
  const { establishment, role } = await getActiveEstablishment();
  if (!establishment || role !== "owner") redirect("/panel");

  const { error } = await uploadEstablishmentPhotoFile(establishment.id, formData);
  if (error) {
    redirect(`/panel/configuracion?error=${encodeURIComponent(error)}`);
  }

  revalidatePath("/panel/configuracion");
  revalidatePath("/");
  redirect("/panel/configuracion?ok=1");
}
