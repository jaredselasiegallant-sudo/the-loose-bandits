import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { validateMember } from "@/lib/validation";

/**
 * Member profiles: admin may edit anyone incl. colors; members may edit their
 * OWN name/bio/avatar only. Color/role changes by non-admin are rejected here
 * (and again by RLS) — the browser's role claim is never trusted.
 */
export async function PUT(req: Request): Promise<Response> {
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ error: "demo" }, { status: 503 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data: me } = await supabase.from("members").select("id,role,slug").eq("auth_id", user.id).single();
  if (!me) return NextResponse.json({ error: "No member profile." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const slug = String(body?.slug ?? "");
  const own = slug === me.slug;
  if (me.role !== "admin" && !own) return NextResponse.json({ error: "You can only edit your own profile." }, { status: 403 });

  // Non-admins: silently drop privileged fields instead of trusting them.
  const input = {
    display_name: String(body?.display_name ?? ""),
    bio: String(body?.bio ?? ""),
    primary_color: String(body?.primary_color ?? "#000000"),
    soft_color: String(body?.soft_color ?? "#000000"),
    ink_color: String(body?.ink_color ?? "#000000"),
    on_primary_color: String(body?.on_primary_color ?? "#FFFFFF"),
    avatar_url: String(body?.avatar_url ?? ""),
    mark: String(body?.mark ?? ""),
  };
  const errs = validateMember(input);
  if (errs.length > 0) return NextResponse.json({ error: `${errs[0].field}: ${errs[0].message}` }, { status: 400 });

  const patch: Record<string, string> =
    me.role === "admin"
      ? { ...input }
      : { display_name: input.display_name, bio: input.bio, avatar_url: input.avatar_url };

  const { error } = await supabase.from("members").update(patch).eq("slug", slug);
  if (error) return NextResponse.json({ error: "Save failed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
