"use server";

import { createClient } from "@/lib/supabase/server";

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
