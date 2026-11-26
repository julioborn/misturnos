"use client";

import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { SportFilter, type SportKey } from "@/components/player/sport-filter";
import { EstablishmentCard, type EstablishmentListItem } from "@/components/player/establishment-card";
import { Input } from "@/components/ui/input";

export function HomeExplorer({ establishments }: { establishments: EstablishmentListItem[] }) {
  const [selected, setSelected] = useState<SportKey>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const bySport = selected === "all" ? establishments : establishments.filter((e) => e.sports.includes(selected));
    const q = query.trim().toLowerCase();
    if (!q) return bySport;
    return bySport.filter((e) => e.name.toLowerCase().includes(q));
  }, [establishments, selected, query]);

  return (
    <div className="flex flex-col gap-4">
      <SportFilter selected={selected} onSelect={setSelected} />

      <div className="flex items-center gap-2">
        <MapPin className="size-5 shrink-0 text-[#111111]" />
        <h2 className="text-[17px] font-bold text-[#111111]">Establecimientos</h2>
        <div className="relative ml-auto w-40">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#9a9a9e]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar club..."
            className="h-8 rounded-full border-none bg-white pl-8 text-[13px] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((e) => (
          <EstablishmentCard key={e.id} establishment={e} />
        ))}

        {filtered.length === 0 && (
          <p className="py-10 text-center text-[14px] text-[#636366]">
            {establishments.length === 0
              ? "Todavía no hay establecimientos disponibles."
              : "No hay establecimientos para esa búsqueda."}
          </p>
        )}
      </div>
    </div>
  );
}
