import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Admin-only invite. Service-role key never leaves the server; the caller's
 * admin role is verified from the DB session first. No public self-registration.
 */
export async function POST(req: Request): Promise<Response> {
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ error: "demo" }, { status: 503 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data: me } = await supabase.from("members").select("id,role").eq("auth_id", user.id).single();
  if (me?.role !== "admin") return NextResponse.json({ error: "Admin only." }, { status: 403 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service || service.includes("placeholder"))
    return NextResponse.json({ error: "Service key not configured." }, { status: 500 });

  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim();
  const slug = String(body?.memberSlug ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  if (!/^member-[1-4]$/.test(slug)) return NextResponse.json({ error: "Pick member-1 … member-4." }, { status: 400 });

  const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: site ? `${site}/auth/confirm?next=/dashboard` : undefined,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Pre-link the invited auth user to their member row when possible.
  if (data.user) {
    await supabase.from("members").update({ auth_id: data.user.id }).eq("slug", slug);
  }
  return NextResponse.json({ ok: true });
}
