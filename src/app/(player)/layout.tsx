import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, LayoutDashboard, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import { PlayerTopNav, PlayerBottomNav } from "@/components/player/player-nav";
import { PushRegistration } from "@/components/player/push-registration";
import { Button } from "@/components/ui/button";

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

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
    <div className="flex min-h-full flex-1 flex-col pb-16 [html[data-platform='ios']_&]:pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0">
      <PushRegistration />
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-background/80 px-4 py-3 [html[data-platform='ios']_&]:pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur supports-backdrop-filter:bg-background/60 sm:px-6">
        <Link href="/" className="text-base font-bold tracking-tight">
          Mis Turnos
        </Link>
        <PlayerTopNav unreadCount={count ?? 0} />
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
          <Button variant="ghost" size="sm" render={<Link href="/cuenta" />}>
            <UserCircle className="size-4" />
            <span className="hidden sm:inline">Cuenta</span>
          </Button>
          <form action={signOut}>
            <Button variant="ghost" size="sm">
              Salir
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <PlayerBottomNav unreadCount={count ?? 0} />
    </div>
  );
}
