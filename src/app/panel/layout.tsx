import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveEstablishment } from "@/lib/panel/establishment";
import { signOut } from "@/app/actions";
import { switchEstablishment } from "./switch-actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, establishment, role, memberships } = await getActiveEstablishment();
  if (!user) redirect("/login");

  if (!establishment) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-gray-500">No sos miembro de ningún establecimiento todavía.</p>
        <form action={signOut}>
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium">
            Cerrar sesión
          </button>
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
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex flex-col">
          <h1 className="text-base font-bold">{establishment.name}</h1>
          {memberships.length > 1 && (
            <form action={switchEstablishment} className="flex items-center gap-1">
              <select name="establishment_id" defaultValue={establishment.id} className="text-xs text-gray-500">
                {memberships.map((m) => (
                  <option key={m.establishment_id} value={m.establishment_id}>
                    {m.establishments?.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="text-xs font-medium text-emerald-700 underline">
                Cambiar
              </button>
            </form>
          )}
        </div>
        <form action={signOut}>
          <button className="text-sm font-medium text-gray-500">Salir</button>
        </form>
      </header>

      <nav className="flex border-b border-gray-200 text-sm">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className="flex-1 px-2 py-2.5 text-center font-medium text-gray-600">
            {t.label}
          </Link>
        ))}
      </nav>

      <main className="flex-1 px-4 py-4">{children}</main>
    </div>
  );
}
