"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const THRESHOLD = 64;
const MAX_PULL = 110;

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    if (refreshing || window.scrollY > 0) {
      startY.current = null;
      return;
    }
    startY.current = e.touches[0].clientY;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (startY.current == null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta <= 0 || window.scrollY > 0) {
      setPull(0);
      return;
    }
    // Resistencia elástica: no sigue 1:1 al dedo, cuesta más a medida que se estira.
    setPull(Math.min(MAX_PULL, delta * 0.5));
  }

  function onTouchEnd() {
    const shouldRefresh = pull >= THRESHOLD;
    startY.current = null;

    if (!shouldRefresh || refreshing) {
      setPull(0);
      return;
    }

    setRefreshing(true);
    setPull(THRESHOLD);
    router.refresh();
    // router.refresh() no devuelve una promesa que avise cuándo terminó de
    // reconciliar, así que ocultamos el indicador después de un rato prudencial.
    setTimeout(() => {
      setRefreshing(false);
      setPull(0);
    }, 700);
  }

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-150 ease-out"
        style={{ height: pull }}
      >
        <Loader2
          className={cn("size-5 text-[#636366]", refreshing && "animate-spin")}
          style={!refreshing ? { transform: `rotate(${pull * 3}deg)`, opacity: Math.min(1, pull / THRESHOLD) } : undefined}
        />
      </div>
      {children}
    </div>
  );
}
