"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarCheck, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/mis-turnos", label: "Mis turnos", icon: CalendarCheck },
  { href: "/notificaciones", label: "Avisos", icon: Bell },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

// Barra inferior fija en mobile. Ojo: tiene que vivir FUERA del <header> —
// si un ancestro tiene backdrop-filter/transform (como el blur del header),
// se convierte en el contenedor de los elementos `fixed`, y esta barra
// termina pegada ahí en vez de al fondo real de la pantalla.
export function PlayerBottomNav({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 sm:hidden">
      {ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span className="relative">
              <Icon className="size-5" />
              {item.href === "/notificaciones" && unreadCount > 0 && (
                <Badge className="absolute -right-2 -top-1.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// Nav horizontal para desktop, va adentro del header.
export function PlayerTopNav({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50",
            )}
          >
            <Icon className="size-4" />
            {item.label}
            {item.href === "/notificaciones" && unreadCount > 0 && (
              <Badge className="h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
