"use client";

import { es } from "date-fns/locale";
import { ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function WeekCalendarTrigger({
  date,
  label,
  onSelect,
}: {
  date: string;
  label: string;
  onSelect: (dateKey: string) => void;
}) {
  // Ojo: no usar toISOString() acá — es UTC y puede desfasar un día según
  // el huso horario del navegador. Leemos los componentes de fecha en local.
  function dateKeyFromLocalDate(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-1 text-[14px] font-medium text-[#636366]"
          />
        }
      >
        <span className="capitalize">{label}</span>
        <ChevronDown className="size-4" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          locale={es}
          selected={new Date(`${date}T00:00:00`)}
          onSelect={(d) => d && onSelect(dateKeyFromLocalDate(d))}
          disabled={{ before: today }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
