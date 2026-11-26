import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const ACTIVE_EST_COOKIE = "active_est";

export async function getMemberships() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, memberships: [] as const };

  const { data } = await supabase
    .from("establishment_members")
    .select("establishment_id, role, establishments(id,name,slug,timezone,cancel_hours_before,active,address,phone,description,photos)")
    .eq("user_id", user.id);

  return { user, memberships: data ?? [] };
}

export async function getActiveEstablishment() {
  const { user, memberships } = await getMemberships();
  if (!user || memberships.length === 0) {
    return { user, establishment: null, role: null, memberships };
  }

  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_EST_COOKIE)?.value;
  const found = memberships.find((m) => m.establishment_id === activeId) ?? memberships[0];

  return { user, establishment: found.establishments, role: found.role, memberships };
}
