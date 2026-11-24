import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import { PlayerNav } from "@/components/player/player-nav";
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

  return (
    <div className="flex min-h-full flex-1 flex-col pb-16 sm:pb-0">
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <Link href="/" className="text-base font-bold">
          Mis Turnos
        </Link>
        <PlayerNav unreadCount={count ?? 0} />
        <form action={signOut}>
          <Button variant="ghost" size="sm">
            Salir
          </Button>
        </form>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
