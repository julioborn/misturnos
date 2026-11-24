import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import { PlayerNav } from "@/components/player/player-nav";
import { Logo } from "@/components/logo";
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
    <div className="flex min-h-full flex-1 flex-col pb-16 sm:pb-0">
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3 sm:px-6">
        <Link href="/">
          <Logo size={26} />
        </Link>
        <PlayerNav unreadCount={count ?? 0} />
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

      <main className="flex-1">{children}</main>
    </div>
  );
}
