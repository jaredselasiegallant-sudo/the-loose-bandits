import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { validatePost } from "@/lib/validation";

async function caller(supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabase>>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: me } = await supabase.from("members").select("id,role,slug").eq("auth_id", user.id).single();
  return me;
}

/** Posts: authors act on OWN posts only; admin on all. Drafts never leak via RLS. */
export async function PUT(req: Request): Promise<Response> {
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ error: "demo" }, { status: 503 });
  const me = await caller(supabase);
  if (!me) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const errs = validatePost({
    title: String(body?.title ?? ""),
    deck: String(body?.deck ?? ""),
    excerpt: String(body?.excerpt ?? ""),
    format: String(body?.format ?? ""),
    status: String(body?.status ?? ""),
    slug: String(body?.slug ?? ""),
    seo_title: String(body?.seo_title ?? ""),
    seo_description: String(body?.seo_description ?? ""),
  });
  if (errs.length > 0) return NextResponse.json({ error: `${errs[0].field}: ${errs[0].message}` }, { status: 400 });

  // Ownership check from the DB row — never the browser's memberSlug claim.
  const { data: row } = await supabase.from("posts").select("id,author_member_id").eq("id", body.id).single();
  if (!row) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (me.role !== "admin" && row.author_member_id !== me.id)
    return NextResponse.json({ error: "You can only edit your own posts." }, { status: 403 });

  const patch = {
    title: String(body.title),
    slug: String(body.slug),
    deck: String(body.deck ?? ""),
    excerpt: String(body.excerpt ?? ""),
    format: String(body.format),
    status: String(body.status),
    scheduled_for: body.scheduled_for ? new Date(body.scheduled_for).toISOString() : null,
    published_at: body.status === "published" ? new Date().toISOString() : null,
    seo_title: String(body.seo_title ?? ""),
    seo_description: String(body.seo_description ?? ""),
    updated_by: me.id,
  };
  const { error } = await supabase.from("posts").update(patch).eq("id", body.id);
  if (error) return NextResponse.json({ error: "Save failed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Archive (soft-delete): sets archived_at so public feeds drop it but it stays recoverable. */
export async function DELETE(req: Request): Promise<Response> {
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ error: "demo" }, { status: 503 });
  const me = await caller(supabase);
  if (!me) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const { data: row } = await supabase.from("posts").select("id,author_member_id").eq("id", body?.id).single();
  if (!row) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (me.role !== "admin" && row.author_member_id !== me.id)
    return NextResponse.json({ error: "You can only archive your own posts." }, { status: 403 });
  const { error } = await supabase
    .from("posts")
    .update({ archived_at: new Date().toISOString(), status: "draft", updated_by: me.id })
    .eq("id", body.id);
  if (error) return NextResponse.json({ error: "Archive failed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
