"use server";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { fetchAvailability } from "@/lib/booking/availability";

export async function getAvailabilityAction(courtId: string, date: string) {
  const slots = await fetchAvailability(courtId, date);
  return { slots };
}

export async function createBookingAction(courtId: string, startsAt: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_booking", {
    p_court: courtId,
    p_starts_at: startsAt,
  });
  return { error: error?.message ?? null };
}

export async function cancelBookingAction(bookingId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_booking", { p_booking: bookingId });
  return { error: error?.message ?? null };
}

export async function markNotificationReadAction(notificationId: string) {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);
}

export async function registerDeviceTokenAction(token: string, platform: "android" | "ios" | "web") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("device_tokens")
    .upsert({ user_id: user.id, token, platform }, { onConflict: "token" });
}

export async function deleteAccountAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  if (profile?.is_super_admin) {
    return { error: "No podés eliminar la cuenta de super admin desde acá. Escribinos a julio@estudioborn.com.ar." };
  }

  const { data: membership } = await supabase
    .from("establishment_members")
    .select("establishment_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership) {
    return { error: "Tu cuenta administra un establecimiento. Para eliminarla, escribinos a julio@estudioborn.com.ar." };
  }

  // auth.users no tiene FKs con cascade hacia estas tablas: hay que
  // borrar los datos personales a mano antes de borrar el usuario.
  const adminClient = createAdminClient();
  await adminClient.from("device_tokens").delete().eq("user_id", user.id);
  await adminClient.from("notifications").delete().eq("user_id", user.id);
  await adminClient.from("profiles").delete().eq("id", user.id);

  const { error } = await adminClient.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  redirect("/login?eliminada=1");
}
