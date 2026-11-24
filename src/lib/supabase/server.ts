import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

// Cliente para Server Components, Server Actions y Route Handlers.
// Usa la service role key SOLO para operaciones que RLS no puede cubrir
// (ej: crear el auth.user de un dueño). Nunca se importa en el browser.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Se llama desde un Server Component (no puede escribir cookies).
            // El middleware ya se encarga de refrescar la sesión en ese caso.
          }
        },
      },
    },
  );
}

// Cliente admin (service role). Solo para Route Handlers / Server Actions
// que necesitan bypassear RLS (p. ej. crear usuarios desde el panel de super admin).
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // El cliente admin no maneja sesión de usuario.
        },
      },
    },
  );
}
