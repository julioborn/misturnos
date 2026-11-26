import { createClient } from "@/lib/supabase/server";
import { utcToLocal } from "@/lib/time/argentina";

export type BookingSlot = {
  startsAt: string;
  startTime: string;
  endTime: string;
  price: string;
  isFree: boolean;
};

type AvailabilityRow = { starts_at: string; ends_at: string; is_free: boolean; price: number };

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR").format(Math.round(price));
}

export async function fetchAvailability(courtId: string, date: string): Promise<BookingSlot[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_availability", {
    p_court: courtId,
    p_day: date,
  });

  const rows = (data ?? []) as AvailabilityRow[];
  return rows.map((slot) => {
    const { time: startTime } = utcToLocal(new Date(slot.starts_at));
    const { time: endTime } = utcToLocal(new Date(slot.ends_at));
    return {
      startsAt: slot.starts_at,
      startTime,
      endTime,
      price: formatPrice(slot.price),
      isFree: slot.is_free,
    };
  });
}
