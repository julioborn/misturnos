"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveEstablishment } from "@/lib/panel/establishment";

export async function blockPlayer(userId: string, formData: FormData) {
  const { establishment } = await getActiveEstablishment();
  if (!establishment) redirect("/panel");

  const reason = String(formData.get("reason") ?? "").trim() || null;
  const supabase = await createClient();
  await supabase
    .from("establishment_player_blocks")
    .upsert(
      { establishment_id: establishment.id, user_id: userId, reason },
      { onConflict: "establishment_id,user_id" },
    );

  revalidatePath("/panel/jugadores");
}

export async function unblockPlayer(userId: string) {
  const { establishment } = await getActiveEstablishment();
  if (!establishment) redirect("/panel");

  const supabase = await createClient();
  await supabase
    .from("establishment_player_blocks")
    .delete()
    .eq("establishment_id", establishment.id)
    .eq("user_id", userId);

  revalidatePath("/panel/jugadores");
}
