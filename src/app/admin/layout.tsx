import Link from "next/link";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_super_admin) redirect("/");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/60">
        <Link href="/admin" className="flex flex-col leading-tight">
          <span className="text-sm font-bold tracking-tight">Mis Turnos</span>
          <span className="text-xs text-muted-foreground">Admin</span>
        </Link>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" render={<Link href="/" />}>
            <User className="size-4" />
            <span className="hidden sm:inline">Jugador</span>
          </Button>
          <form action={signOut}>
            <Button variant="ghost" size="sm">
              Salir
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-4 py-4">{children}</main>
    </div>
  );
}
