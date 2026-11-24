"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function PanelNav({ tabs }: { tabs: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex overflow-x-auto border-b text-sm">
      {tabs.map((t) => {
        const active = t.href === "/panel" ? pathname === "/panel" : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "flex-1 whitespace-nowrap border-b-2 px-3 py-2.5 text-center font-medium",
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
