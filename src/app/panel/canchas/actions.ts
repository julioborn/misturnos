"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveEstablishment } from "@/lib/panel/establishment";

async function requireEstablishmentId() {
  const { establishment } = await getActiveEstablishment();
  if (!establishment) redirect("/panel");
  return establishment.id;
}

export async function createCourt(formData: FormData) {
  const establishmentId = await requireEstablishmentId();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const sport = String(formData.get("sport") ?? "padel");
  const variant = String(formData.get("variant") ?? "").trim() || null;
  const slotMinutes = Number(formData.get("slot_minutes") ?? 90);
  const defaultPrice = Number(formData.get("default_price") ?? 0);

  const { error } = await supabase.from("courts").insert({
    establishment_id: establishmentId,
    name,
    sport: sport as "padel" | "futbol",
    variant,
    slot_minutes: slotMinutes,
    default_price: defaultPrice,
  });

  if (error) redirect(`/panel/canchas/nueva?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/panel/canchas");
  redirect("/panel/canchas");
}

export async function updateCourt(courtId: string, formData: FormData) {
  await requireEstablishmentId();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const sport = String(formData.get("sport") ?? "padel");
  const variant = String(formData.get("variant") ?? "").trim() || null;
  const slotMinutes = Number(formData.get("slot_minutes") ?? 90);
  const defaultPrice = Number(formData.get("default_price") ?? 0);

  const { error } = await supabase
    .from("courts")
    .update({
      name,
      sport: sport as "padel" | "futbol",
      variant,
      slot_minutes: slotMinutes,
      default_price: defaultPrice,
    })
    .eq("id", courtId);

  if (error) redirect(`/panel/canchas/${courtId}?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/panel/canchas");
  revalidatePath(`/panel/canchas/${courtId}`);
  redirect(`/panel/canchas/${courtId}?ok=1`);
}

export async function toggleCourtActive(courtId: string, nextActive: boolean) {
  await requireEstablishmentId();
  const supabase = await createClient();
  await supabase.from("courts").update({ active: nextActive }).eq("id", courtId);
  revalidatePath("/panel/canchas");
  revalidatePath(`/panel/canchas/${courtId}`);
}

export async function addCourtHour(courtId: string, formData: FormData) {
  await requireEstablishmentId();
  const supabase = await createClient();

  const weekday = Number(formData.get("weekday"));
  const openTime = String(formData.get("open_time") ?? "");
  const closeTime = String(formData.get("close_time") ?? "");

  const { error } = await supabase
    .from("court_hours")
    .insert({ court_id: courtId, weekday, open_time: openTime, close_time: closeTime });

  if (error) redirect(`/panel/canchas/${courtId}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/panel/canchas/${courtId}`);
  redirect(`/panel/canchas/${courtId}`);
}

export async function removeCourtHour(courtId: string, hourId: string) {
  await requireEstablishmentId();
  const supabase = await createClient();
  await supabase.from("court_hours").delete().eq("id", hourId);
  revalidatePath(`/panel/canchas/${courtId}`);
}

export async function addCourtPrice(courtId: string, formData: FormData) {
  await requireEstablishmentId();
  const supabase = await createClient();

  const weekdayRaw = String(formData.get("weekday") ?? "");
  const weekday = weekdayRaw === "" ? null : Number(weekdayRaw);
  const fromTime = String(formData.get("from_time") ?? "");
  const toTime = String(formData.get("to_time") ?? "");
  const price = Number(formData.get("price") ?? 0);

  const { error } = await supabase
    .from("court_prices")
    .insert({ court_id: courtId, weekday, from_time: fromTime, to_time: toTime, price });

  if (error) redirect(`/panel/canchas/${courtId}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/panel/canchas/${courtId}`);
  redirect(`/panel/canchas/${courtId}`);
}

export async function removeCourtPrice(courtId: string, priceId: string) {
  await requireEstablishmentId();
  const supabase = await createClient();
  await supabase.from("court_prices").delete().eq("id", priceId);
  revalidatePath(`/panel/canchas/${courtId}`);
}
