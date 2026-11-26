import Link from "next/link";
import { MapPin } from "lucide-react";
import { sportLabel } from "@/lib/sports";

export type EstablishmentListItem = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  image: string | null;
  sports: string[];
};

export function EstablishmentCard({ establishment }: { establishment: EstablishmentListItem }) {
  const sportsLabel = establishment.sports.map((s) => sportLabel(s)).join(" · ");

  return (
    <Link
      href={`/establecimientos/${establishment.slug}`}
      className="flex touch-manipulation flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-transform duration-100 ease-out active:scale-[0.98] active:bg-[#F2F2F7]"
    >
      <div className="aspect-[4/3] w-full bg-[#E5E5EA]">
        {establishment.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={establishment.image}
            alt={establishment.name}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-0.5 p-2">
        <span className="truncate text-[13px] font-semibold text-[#111111]">
          {establishment.name}
        </span>
        {sportsLabel && <span className="truncate text-[11px] text-[#636366]">{sportsLabel}</span>}
        {establishment.address && (
          <span className="flex items-center gap-1 truncate text-[11px] text-[#636366]">
            <MapPin className="size-2.5 shrink-0" />
            {establishment.address}
          </span>
        )}
      </div>
    </Link>
  );
}
