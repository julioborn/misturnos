"use client";

import { useEffect } from "react";

// Marca <html data-platform="ios"> solo cuando corremos adentro del WebView
// de Capacitor en iOS. El CSS de safe-area (notch / home indicator) se
// engancha a ese atributo para no afectar la web normal ni la app Android,
// donde Capacitor ya maneja los insets de otra forma.
export function PlatformFlag() {
  useEffect(() => {
    let cancelled = false;

    async function setup() {
      const { Capacitor } = await import("@capacitor/core");
      if (cancelled) return;
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios") {
        document.documentElement.setAttribute("data-platform", "ios");
      }
    }

    setup();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
