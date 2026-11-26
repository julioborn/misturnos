"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getActiveEstablishment } from "@/lib/panel/establishment";

const PHOTOS_BUCKET = "establishment-photos";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/panel/configuracion?error=${encodeURIComponent("Elegí una foto para subir")}`);
  }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    redirect(`/panel/configuracion?error=${encodeURIComponent("La foto tiene que ser JPG, PNG o WEBP")}`);
  }
  if (file.size > MAX_PHOTO_BYTES) {
    redirect(`/panel/configuracion?error=${encodeURIComponent("La foto no puede pesar más de 5 MB")}`);
  }

  const adminClient = createAdminClient();
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${establishment.id}/foto-principal-${Date.now()}.${extension}`;

  const { error: uploadError } = await adminClient.storage
    .from(PHOTOS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    redirect(`/panel/configuracion?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { data: publicUrl } = adminClient.storage.from(PHOTOS_BUCKET).getPublicUrl(path);

  const { error: updateError } = await adminClient
    .from("establishments")
    .update({ photos: [publicUrl.publicUrl] })
    .eq("id", establishment.id);

  if (updateError) {
    redirect(`/panel/configuracion?error=${encodeURIComponent(updateError.message)}`);
  }

  revalidatePath("/panel/configuracion");
  revalidatePath("/");
  redirect("/panel/configuracion?ok=1");
}
