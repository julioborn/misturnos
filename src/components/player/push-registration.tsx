"use client";

import { useEffect } from "react";
import { registerDeviceTokenAction } from "@/app/(player)/actions";

// No hace nada en el navegador normal — solo cuando la app corre adentro
// del WebView de Capacitor (la futura app de Android/iOS). Pide permiso
// de notificaciones, registra el dispositivo en FCM y guarda el token.
export function PushRegistration() {
  useEffect(() => {
    let cancelled = false;

    async function setup() {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) return;

      const { PushNotifications } = await import("@capacitor/push-notifications");
      const platform = Capacitor.getPlatform() as "android" | "ios";

      const permission = await PushNotifications.checkPermissions();
      let status = permission.receive;
      if (status === "prompt" || status === "prompt-with-rationale") {
        status = (await PushNotifications.requestPermissions()).receive;
      }
      if (status !== "granted" || cancelled) return;

      await PushNotifications.register();

      PushNotifications.addListener("registration", (token) => {
        registerDeviceTokenAction(token.value, platform);
      });
      PushNotifications.addListener("registrationError", (err) => {
        console.error("Error registrando push:", err);
      });
    }

    setup();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
