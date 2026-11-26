import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { todayLocal } from "@/lib/time/argentina";
import { fetchAvailability } from "@/lib/booking/availability";
import { BookingScreen } from "@/components/player/booking-screen";

export default async function EstablishmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ court?: string; date?: string }>;
}) {
  const { slug } = await params;
  const { court: courtParam, date: dateParam } = await searchParams;

  const supabase = await createClient();
  const { data: establishment } = await supabase
    .from("establishments")
    .select("id,name,address,photos,logo_url")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!establishment) notFound();

  const { data: courts } = await supabase
    .from("courts")
    .select("id,name,sport,variant")
    .eq("establishment_id", establishment.id)
    .eq("active", true)
    .order("sort_order");

  if (!courts || courts.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <h1 className="text-2xl font-bold">{establishment.name}</h1>
        <p className="mt-4 text-base text-muted-foreground">Esta cancha todavía no tiene canchas cargadas.</p>
      </div>
    );
  }

  const courtId = courtParam && courts.some((c) => c.id === courtParam) ? courtParam : courts[0].id;
  const date = dateParam ?? todayLocal();
  const slots = await fetchAvailability(courtId, date);

  const image = establishment.photos?.[0] ?? establishment.logo_url ?? null;

  return (
    <div
      className="mx-auto flex max-w-2xl flex-col gap-5 bg-[#F2F2F7] p-4 sm:p-6"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}
    >
      <div className="relative flex items-center justify-center">
        <Link
          href="/"
          className="absolute left-0 flex size-9 touch-manipulation items-center justify-center rounded-full text-[#111111] active:bg-[#E5E5EA]"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="text-[18px] font-semibold text-[#111111]">Reservar turno</h1>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#E5E5EA]">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={establishment.name} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-[18px] font-semibold text-[#111111]">{establishment.name}</span>
          {establishment.address && (
            <span className="flex items-center gap-1 truncate text-[14px] text-[#636366]">
              <MapPin className="size-3.5 shrink-0" />
              {establishment.address}
            </span>
          )}
        </div>
      </div>

      <BookingScreen
        courts={courts}
        initialCourtId={courtId}
        initialDate={date}
        initialSlots={slots}
      />
    </div>
  );
}
