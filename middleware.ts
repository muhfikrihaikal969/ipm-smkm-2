import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));

  // Optimasi: Jika tidak ada cookie sesi dan bukan rute /admin, langsung lewati
  if (!hasAuthCookie && !isAdminRoute) {
    return response;
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Hapus otomatis cookie Supabase yang rusak/expired agar tidak berulang
    if (error) {
      request.cookies.getAll().forEach((cookie) => {
        if (cookie.name.startsWith("sb-")) {
          response.cookies.delete(cookie.name);
        }
      });
    }

    // Proteksi Khusus Rute /admin
    if (isAdminRoute && !user) {
      const redirectResponse = NextResponse.redirect(
        new URL("/login", request.url)
      );
      // Pastikan cookie yang rusak juga dihapus saat redirect
      if (error) {
        request.cookies.getAll().forEach((cookie) => {
          if (cookie.name.startsWith("sb-")) {
            redirectResponse.cookies.delete(cookie.name);
          }
        });
      }
      return redirectResponse;
    }
  } catch {
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};