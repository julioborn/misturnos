import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import { PlayerTopNav, PlayerBottomNav } from "@/components/player/player-nav";
import { PushRegistration } from "@/components/player/push-registration";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { Button } from "@/components/ui/button";

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  const { data: membership } = profile?.is_super_admin
    ? { data: null }
    : await supabase
        .from("establishment_members")
        .select("establishment_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#F2F2F7] pb-16 [html[data-platform='ios']_&]:pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0">
      <PushRegistration />
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-[#E5E5EA] bg-[#F2F2F7]/80 px-4 py-3 [html[data-platform='ios']_&]:pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur supports-backdrop-filter:bg-[#F2F2F7]/60 sm:px-6">
        <Link href="/" className="text-base font-bold tracking-tight">
          Mis Turnos
        </Link>
        <PlayerTopNav />
        <div className="flex items-center gap-1">
          {profile?.is_super_admin && (
            <Button variant="ghost" size="sm" render={<Link href="/admin" />}>
              <ShieldCheck className="size-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          )}
          {membership && (
            <Button variant="ghost" size="sm" render={<Link href="/panel" />}>
              <LayoutDashboard className="size-4" />
              <span className="hidden sm:inline">Panel</span>
            </Button>
          )}
          <form action={signOut}>
            <Button variant="ghost" size="sm">
              Salir
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1">
        <PullToRefresh>{children}</PullToRefresh>
      </main>

      <PlayerBottomNav />
    </div>
  );
}
