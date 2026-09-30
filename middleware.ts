import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = [/^\/dashboard/, /^\/write/, /^\/media/, /^\/settings/, /^\/preview/, /^\/admin/];

/**
 * Signed-out visitors are redirected to /login on protected routes whenever
 * Supabase is configured. With placeholder env (local demo) requests pass
 * through so the dashboard UX is reviewable; the dashboard itself banners
 * demo mode and RLS still guards real data in production.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some((re) => re.test(pathname))) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon || url.includes("placeholder")) return NextResponse.next();

  const res = NextResponse.next();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const login = req.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/write/:path*", "/media/:path*", "/settings/:path*", "/preview/:path*", "/admin/:path*"],
};
