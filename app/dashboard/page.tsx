import Link from "next/link";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import type { MemberRow } from "@/components/dashboard/MemberForms";
import type { DashboardPost } from "@/components/dashboard/PostsManager";
import type { MediaRow } from "@/components/dashboard/MediaManager";
import { MEMBERS } from "@/lib/members";
import { PLACEHOLDER_POSTS } from "@/lib/posts";
import { getSiteSettingsServer } from "@/lib/site-server";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const settings = await getSiteSettingsServer();
  const supabase = await createServerSupabase();

  // Demo mode (no Supabase): reviewable dashboard with placeholder data.
  if (!supabase) {
    const members: MemberRow[] = MEMBERS.map((m) => ({
      slug: m.slug,
      display_name: m.name,
      bio: m.bio,
      primary_color: m.theme.primary,
      soft_color: m.theme.soft,
      ink_color: m.theme.ink,
      on_primary_color: m.theme.onPrimary,
      avatar_url: "",
      mark: m.mark,
    }));
    const posts: DashboardPost[] = PLACEHOLDER_POSTS.map((p) => ({
      id: `${p.memberSlug}/${p.slug}`,
      slug: p.slug,
      memberSlug: p.memberSlug,
      title: p.title,
      deck: p.deck,
      excerpt: p.excerpt,
      format: p.format,
      status: "published",
      scheduled_for: "",
      seo_title: p.title,
      seo_description: p.deck,
      updated_at: p.date,
    }));
    const media: MediaRow[] = [
      { id: "demo-cover-1", display_name: "TODO cover — featured", alt_text: "", caption: "TODO caption", tags: "cover", usedBy: ["placeholder-featured-essay"], archived: false },
      { id: "demo-avatar-1", display_name: "TODO avatar — member 1", alt_text: "", caption: "", tags: "avatar", usedBy: ["member-1 profile"], archived: false },
    ];
    return (
      <main className="mx-auto max-w-6xl px-5 py-10 flex flex-col gap-6">
        <p className="meta">Dashboard · demo mode (Supabase not connected)</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Dashboard</h1>
        <div className="hero" role="note">
          <p className="lede">
            Demo preview: edits save locally in this browser. Connect Supabase (DEPLOY.md) so the
            whole family shares one database — no code changes or redeploys needed either way.
          </p>
          <div className="mt-3 flex gap-2">
            <Link href="/login" className="btn btn-secondary">Sign in when configured</Link>
            <Link href="/" className="btn btn-secondary">← Public site</Link>
          </div>
        </div>
        <DashboardTabs settings={settings} members={members} posts={posts} media={media} isAdmin ownSlug="member-1" />
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="meta">Not signed in</p>
        <Link href="/login" className="btn mt-4">Sign in</Link>
      </main>
    );
  }

  const { data: me } = await supabase.from("members").select("id,display_name,role,slug").eq("auth_id", user.id).single();
  const isAdmin = me?.role === "admin";
  const { data: memberRows } = await supabase.from("members").select("slug,display_name,bio,primary_color,soft_color,ink_color,on_primary_color,avatar_url,mark").order("slug");
  const { data: postRows } = await supabase
    .from("posts")
    .select("id,slug,title,deck,excerpt,format,status,scheduled_for,seo_title,seo_description,updated_at,author_member_id,members!inner(slug)")
    .order("updated_at", { ascending: false })
    .limit(50);
  const { data: assetRows } = await supabase.from("assets").select("id,display_name,alt_text,caption,tags,archived_at").order("created_at", { ascending: false }).limit(50);
  const { data: coverUse } = await supabase.from("posts").select("title,cover_asset_id").not("cover_asset_id", "is", null).limit(100);

  const members: MemberRow[] = (memberRows ?? []).map((m) => ({
    slug: m.slug,
    display_name: m.display_name,
    bio: m.bio ?? "",
    primary_color: m.primary_color,
    soft_color: m.soft_color,
    ink_color: m.ink_color,
    on_primary_color: m.on_primary_color,
    avatar_url: m.avatar_url ?? "",
    mark: m.mark ?? "",
  }));

  const posts: DashboardPost[] = (postRows ?? []).map((p) => {
    const slug = Array.isArray(p.members) ? p.members[0]?.slug ?? "" : (p.members as { slug?: string } | null)?.slug ?? "";
    return {
      id: p.id,
      slug: p.slug,
      memberSlug: slug,
      title: p.title,
      deck: p.deck ?? "",
      excerpt: p.excerpt ?? "",
      format: p.format,
      status: p.status,
      scheduled_for: p.scheduled_for ? String(p.scheduled_for).slice(0, 16) : "",
      seo_title: p.seo_title ?? "",
      seo_description: p.seo_description ?? "",
      updated_at: p.updated_at,
    };
  });

  const usedBy = new Map<string, string[]>();
  for (const u of coverUse ?? []) {
    if (!u.cover_asset_id) continue;
    const list = usedBy.get(u.cover_asset_id) ?? [];
    list.push(u.title);
    usedBy.set(u.cover_asset_id, list);
  }
  const media: MediaRow[] = (assetRows ?? []).map((a) => ({
    id: a.id,
    display_name: a.display_name ?? "Untitled",
    alt_text: a.alt_text ?? "",
    caption: a.caption ?? "",
    tags: Array.isArray(a.tags) ? a.tags.join(", ") : "",
    usedBy: usedBy.get(a.id) ?? [],
    archived: a.archived_at !== null,
  }));

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 flex flex-col gap-6">
      <p className="meta" role="status">Dashboard · {me?.role ?? "member"} · {me?.display_name ?? user.email}</p>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Dashboard</h1>
        <Link href="/" className="btn btn-secondary ml-auto">← Public site</Link>
      </div>
      <DashboardTabs settings={settings} members={members} posts={posts} media={media} isAdmin={isAdmin} ownSlug={me?.slug ?? null} />
    </main>
  );
}
