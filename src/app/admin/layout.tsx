import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import { Logo } from "@/components/logo";
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
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Logo size={24} showText={false} />
          <span className="text-sm font-semibold text-muted-foreground">Admin</span>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="sm">
            Salir
          </Button>
        </form>
      </header>
      <main className="flex-1 px-4 py-4">{children}</main>
    </div>
  );
}
