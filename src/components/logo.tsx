import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  size = 28,
  showText = true,
  className,
}: {
  size?: number;
  showText?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/512x512.png"
        alt="Mis Turnos"
        width={size}
        height={size}
        className="shrink-0 rounded-md"
        priority
      />
      {showText && <span className="font-semibold tracking-tight">Mis Turnos</span>}
    </span>
  );
}
