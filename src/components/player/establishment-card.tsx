import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
      className="flex touch-manipulation items-center gap-3 overflow-hidden rounded-2xl bg-white p-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-transform duration-100 ease-out active:scale-[0.98] active:bg-[#F2F2F7]"
    >
      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#E5E5EA]">
        {establishment.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={establishment.image}
            alt={establishment.name}
            className="h-full w-full object-contain"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 py-1">
        <span className="truncate text-[19px] font-semibold text-[#111111]">
          {establishment.name}
        </span>
        {sportsLabel && <span className="truncate text-[14px] text-[#636366]">{sportsLabel}</span>}
      </div>

      <ChevronRight className="size-5 shrink-0 text-[#636366]" />
    </Link>
  );
}
