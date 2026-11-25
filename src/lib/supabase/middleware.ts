import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

const PUBLIC_PATHS = ["/login", "/register", "/auth/callback"];
// Accesibles para cualquiera, estés logueado o no (no se redirigen nunca).
const ALWAYS_ACCESSIBLE_PATHS = ["/legal"];

function matchesPath(pathname: string, paths: string[]) {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isPublicPath(pathname: string) {
  return matchesPath(pathname, PUBLIC_PATHS);
}

// Se ejecuta en cada request: refresca la sesión y decide a dónde
// corresponde mandar al usuario según su rol.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  if (matchesPath(pathname, ALWAYS_ACCESSIBLE_PATHS)) return response;

  if (!user) {
    if (isPublicPath(pathname)) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  const isSuperAdmin = profile?.is_super_admin ?? false;

  let isOwnerOrStaff = false;
  if (!isSuperAdmin) {
    const { data: membership } = await supabase
      .from("establishment_members")
      .select("establishment_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    isOwnerOrStaff = !!membership;
  }

  const homePath = isSuperAdmin ? "/admin" : isOwnerOrStaff ? "/panel" : "/";

  if (isPublicPath(pathname)) {
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  if (pathname.startsWith("/admin") && !isSuperAdmin) {
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  if (pathname.startsWith("/panel") && !isOwnerOrStaff && !isSuperAdmin) {
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  // A partir de acá el usuario puede moverse libremente entre su panel
  // (admin/dueño/staff) y la vista de jugador en "/" — no lo forzamos a
  // quedarse en su "home" de rol, solo lo mandamos ahí recién logueado.

  return response;
}
