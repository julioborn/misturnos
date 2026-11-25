import type { CapacitorConfig } from '@capacitor/cli';

// La app es un Next.js con Server Actions, middleware y auth por cookies —
// no se puede exportar como sitio estático. En vez de empaquetar archivos,
// el WebView de Capacitor carga directo la app en producción (Vercel).
// Los plugins nativos (push, etc.) igual funcionan ahí: el bridge de
// Capacitor se inyecta en cualquier página que cargue el WebView, local o
// remota.
const config: CapacitorConfig = {
  appId: 'com.misturnos.app',
  appName: 'Mis Turnos Deportivos',
  webDir: 'public',
  server: {
    url: 'https://misturnosdeportivos.vercel.app',
    cleartext: false,
  },
};

export default config;
