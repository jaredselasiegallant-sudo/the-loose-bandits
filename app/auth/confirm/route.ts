import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * GET /auth/confirm?code=…&next=/dashboard
 * Exchanges the email-link code for a session, then redirects.
 * All magic-link, invite, and reset-password emails must point here —
 * add its URLs in Supabase → Auth → URL Configuration → Redirect URLs.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") ?? "/dashboard";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  const fail = (message: string): Response => {
    const login = new URL("/login", url.origin);
    login.searchParams.set("error", message);
    return NextResponse.redirect(login);
  };

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!envUrl || !envAnon) return fail("Auth is not configured on this deployment.");

  const res = NextResponse.redirect(new URL(safeNext, url.origin));
  const supabase = createServerClient(envUrl, envAnon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return fail(error.message);
    return res;
  }
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "invite" | "magiclink" | "recovery" | "email_change",
      token_hash: tokenHash,
    });
    if (error) return fail(error.message);
    return res;
  }
  return fail("This sign-in link is missing its code. Request a fresh one.");
}
