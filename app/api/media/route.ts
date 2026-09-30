import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/** Media metadata: owners edit own assets, admin edits all. Alt text required. */
export async function PUT(req: Request): Promise<Response> {
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ error: "demo" }, { status: 503 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data: me } = await supabase.from("members").select("id,role").eq("auth_id", user.id).single();
  if (!me) return NextResponse.json({ error: "No member profile." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const alt = String(body?.alt_text ?? "").trim();
  if (!alt) return NextResponse.json({ error: "alt_text: Alt text is required." }, { status: 400 });
  if (alt.length > 500) return NextResponse.json({ error: "alt_text: Max 500 chars." }, { status: 400 });

  const { data: row } = await supabase.from("assets").select("id,owner_member_id").eq("id", body?.id).single();
  if (!row) return NextResponse.json({ error: "Asset not found." }, { status: 404 });
  if (me.role !== "admin" && row.owner_member_id !== me.id)
    return NextResponse.json({ error: "You can only edit your own media." }, { status: 403 });

  const tags = String(body?.tags ?? "")
    .split(",")
    .map((t: string) => t.trim())
    .filter(Boolean)
    .slice(0, 20);
  const { error } = await supabase
    .from("assets")
    .update({
      display_name: String(body?.display_name ?? "Untitled").slice(0, 120),
      alt_text: alt,
      caption: String(body?.caption ?? "").slice(0, 600),
      tags,
      updated_by: me.id,
    })
    .eq("id", body.id);
  if (error) return NextResponse.json({ error: "Save failed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Archive asset (never hard-delete from UI): keeps published pages intact. */
export async function DELETE(req: Request): Promise<Response> {
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ error: "demo" }, { status: 503 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data: me } = await supabase.from("members").select("id,role").eq("auth_id", user.id).single();
  if (!me) return NextResponse.json({ error: "No member profile." }, { status: 403 });
  const body = await req.json().catch(() => null);
  const { data: row } = await supabase.from("assets").select("id,owner_member_id").eq("id", body?.id).single();
  if (!row) return NextResponse.json({ error: "Asset not found." }, { status: 404 });
  if (me.role !== "admin" && row.owner_member_id !== me.id)
    return NextResponse.json({ error: "You can only archive your own media." }, { status: 403 });
  const { error } = await supabase
    .from("assets")
    .update({ archived_at: new Date().toISOString(), updated_by: me.id })
    .eq("id", body.id);
  if (error) return NextResponse.json({ error: "Archive failed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
