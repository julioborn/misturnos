import { createClient } from "@/lib/supabase/server";
import { HomeExplorer } from "@/components/player/home-explorer";
import type { EstablishmentListItem } from "@/components/player/establishment-card";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).single()
    : { data: null };

  const { data: establishments } = await supabase
    .from("establishments")
    .select("id,name,slug,address,photos,logo_url,courts(sport,active)")
    .eq("active", true)
    .order("name");

  const items: EstablishmentListItem[] = (establishments ?? []).map((e) => {
    const sports = Array.from(
      new Set(
        (e.courts ?? [])
          .filter((c) => c.active)
          .map((c) => c.sport),
      ),
    );

    return {
      id: e.id,
      name: e.name,
      slug: e.slug,
      address: e.address,
      image: e.photos?.[0] ?? e.logo_url ?? null,
      sports,
    };
  });

  return (
    <div
      className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-4 bg-[#F2F2F7] p-4 sm:p-6"
      style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      <h1 className="text-[18px] font-semibold text-[#111111]">
        ¡Hola{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
      </h1>

      <HomeExplorer establishments={items} />
    </div>
  );
}
