"use client";

import { useEffect } from "react";
import { registerDeviceTokenAction } from "@/app/(player)/actions";

// No hace nada en el navegador normal — solo cuando la app corre adentro
// del WebView de Capacitor (la futura app de Android/iOS). Pide permiso
// de notificaciones y registra el token de FCM (en los dos sistemas:
// @capacitor-firebase/messaging usa el SDK nativo de Firebase tanto en
// Android como en iOS, así que siempre devuelve un token de FCM, nunca
// un token crudo de APNs).
export function PushRegistration() {
  useEffect(() => {
    let cancelled = false;

    async function setup() {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) return;

      const { FirebaseMessaging } = await import("@capacitor-firebase/messaging");
      const platform = Capacitor.getPlatform() as "android" | "ios";

      const permission = await FirebaseMessaging.checkPermissions();
      let status = permission.receive;
      if (status === "prompt" || status === "prompt-with-rationale") {
        status = (await FirebaseMessaging.requestPermissions()).receive;
      }
      if (status !== "granted" || cancelled) return;

      const { token } = await FirebaseMessaging.getToken();
      if (!cancelled) {
        registerDeviceTokenAction(token, platform);
      }

      FirebaseMessaging.addListener("tokenReceived", (event) => {
        registerDeviceTokenAction(event.token, platform);
      });
    }

    setup();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
