"use client";

import { useMemo, useState } from "react";
import { SportFilter, type SportKey } from "@/components/player/sport-filter";
import { EstablishmentCard, type EstablishmentListItem } from "@/components/player/establishment-card";

export function HomeExplorer({ establishments }: { establishments: EstablishmentListItem[] }) {
  const [selected, setSelected] = useState<SportKey>("all");

  const filtered = useMemo(() => {
    if (selected === "all") return establishments;
    return establishments.filter((e) => e.sports.includes(selected));
  }, [establishments, selected]);

  return (
    <div className="flex flex-col gap-4">
      <SportFilter selected={selected} onSelect={setSelected} />

      <div className="flex flex-col gap-3">
        {filtered.map((e) => (
          <EstablishmentCard key={e.id} establishment={e} />
        ))}

        {filtered.length === 0 && (
          <p className="py-10 text-center text-[14px] text-[#636366]">
            {establishments.length === 0
              ? "Todavía no hay establecimientos disponibles."
              : "No hay establecimientos con ese deporte por ahora."}
          </p>
        )}
      </div>
    </div>
  );
}
