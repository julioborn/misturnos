import { createAdminClient } from "@/lib/supabase/server";

const PHOTOS_BUCKET = "establishment-photos";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadEstablishmentPhotoFile(establishmentId: string, formData: FormData) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Elegí una foto para subir" };
  }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return { error: "La foto tiene que ser JPG, PNG o WEBP" };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { error: "La foto no puede pesar más de 5 MB" };
  }

  const adminClient = createAdminClient();
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${establishmentId}/foto-principal-${Date.now()}.${extension}`;

  const { error: uploadError } = await adminClient.storage
    .from(PHOTOS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: publicUrl } = adminClient.storage.from(PHOTOS_BUCKET).getPublicUrl(path);

  const { error: updateError } = await adminClient
    .from("establishments")
    .update({ photos: [publicUrl.publicUrl] })
    .eq("id", establishmentId);

  if (updateError) return { error: updateError.message };

  return { error: null };
}
