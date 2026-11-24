import Link from "next/link";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { getActiveEstablishment } from "@/lib/panel/establishment";
import { signOut } from "@/app/actions";
import { switchEstablishment } from "./switch-actions";
import { Button } from "@/components/ui/button";
import { PanelNav } from "@/components/panel/panel-nav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, establishment, role, memberships } = await getActiveEstablishment();
  if (!user) redirect("/login");

  if (!establishment) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-muted-foreground">No sos miembro de ningún establecimiento todavía.</p>
        <form action={signOut}>
          <Button variant="outline">Cerrar sesión</Button>
        </form>
      </div>
    );
  }

  const tabs = [
    { href: "/panel", label: "Agenda" },
    { href: "/panel/canchas", label: "Canchas" },
    { href: "/panel/jugadores", label: "Jugadores" },
    ...(role === "owner" ? [{ href: "/panel/staff", label: "Staff" }] : []),
    { href: "/panel/configuracion", label: "Config" },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex min-w-0 flex-col leading-tight">
          <Link href="/panel" className="text-sm font-bold tracking-tight">
            Mis Turnos
          </Link>
          {memberships.length > 1 ? (
            <form action={switchEstablishment} className="flex items-center gap-1">
              <select
                name="establishment_id"
                defaultValue={establishment.id}
                className="max-w-32 truncate text-xs text-muted-foreground"
              >
                {memberships.map((m) => (
                  <option key={m.establishment_id} value={m.establishment_id}>
                    {m.establishments?.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="text-xs font-medium underline underline-offset-2">
                Cambiar
              </button>
            </form>
          ) : (
            <span className="truncate text-xs text-muted-foreground">{establishment.name}</span>
          )}
        </div>
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

      <PanelNav tabs={tabs} />

      <main className="flex-1 px-4 py-4">{children}</main>
    </div>
  );
}
