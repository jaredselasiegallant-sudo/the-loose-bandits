import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { validateSiteSettings } from "@/lib/validation";

/** Admin-only site text. Role is read from the DB session — never the request body. */
export async function PUT(req: Request): Promise<Response> {
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ error: "demo" }, { status: 503 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data: me } = await supabase.from("members").select("id,role").eq("auth_id", user.id).single();
  if (me?.role !== "admin") return NextResponse.json({ error: "Admin only." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const errs = validateSiteSettings({
    site_title: String(body?.site_title ?? ""),
    wordmark_text: String(body?.wordmark_text ?? ""),
    home_intro: String(body?.home_intro ?? ""),
    hero_headline: String(body?.hero_headline ?? ""),
    hero_deck: String(body?.hero_deck ?? ""),
    cta_primary: String(body?.cta_primary ?? ""),
    cta_secondary: String(body?.cta_secondary ?? ""),
    about_copy: String(body?.about_copy ?? ""),
    footer_text: String(body?.footer_text ?? ""),
    empty_posts_message: String(body?.empty_posts_message ?? ""),
  });
  if (errs.length > 0) return NextResponse.json({ error: `${errs[0].field}: ${errs[0].message}` }, { status: 400 });

  const { error: snapErr } = await supabase.from("settings_revisions").insert({
    editor_member_id: me.id,
    snapshot: body,
  });
  if (snapErr) return NextResponse.json({ error: "Could not record revision." }, { status: 500 });

  const { error } = await supabase
    .from("site_settings")
    .update({ ...body, updated_by: me.id })
    .eq("id", 1);
  if (error) return NextResponse.json({ error: "Save failed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
