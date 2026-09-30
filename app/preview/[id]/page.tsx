import Link from "next/link";
import type { Metadata } from "next";
import { memberBySlug, memberStyle } from "@/lib/members";
import { MemberBadge } from "@/components/MemberCard";
import { getPost } from "@/lib/posts";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Private draft preview — requires sign-in, never indexed, never in sitemap/RSS. */
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  // Demo mode: ids look like "member-1/slug…" (URL-encoded slash).
  if (!supabase) {
    const decoded = decodeURIComponent(id);
    const [memberSlug, ...rest] = decoded.split("/");
    const post = getPost(memberSlug, rest.join("/"));
    const member = memberBySlug(memberSlug);
    if (!post || !member) {
      return (
        <main className="mx-auto max-w-6xl px-5 py-10">
          <p className="meta">Unknown draft in demo mode.</p>
          <Link href="/dashboard" className="btn btn-secondary mt-4">← Dashboard</Link>
        </main>
      );
    }
    return (
      <main className="mx-auto max-w-6xl px-5 py-10 flex flex-col gap-6" style={memberStyle(member)}>
        <p className="meta" role="status">Private preview · demo · not published</p>
        <MemberBadge member={member} size="sm" />
        <h1 className="font-display text-4xl font-extrabold tracking-tight">{post.title}</h1>
        <p className="lede">{post.deck}</p>
        <div className="prose-measure flex flex-col gap-4">
          {post.body.map((b, i) =>
            b.type === "h2" ? (
              <h2 key={i} className="font-display text-2xl font-bold">{b.text}</h2>
            ) : b.type === "quote" ? (
              <blockquote key={i} className="border-l-4 pl-4 font-display text-xl italic">“{b.text}”</blockquote>
            ) : b.type === "list" ? (
              <ul key={i} className="list-disc pl-6">{b.items.map((it) => <li key={it}>{it}</li>)}</ul>
            ) : b.type === "image" ? (
              <figure key={i}><figcaption className="text-sm opacity-80">{b.caption} (alt: {b.alt})</figcaption></figure>
            ) : (
              <p key={i} className="leading-[1.75]">{b.text}</p>
            )
          )}
        </div>
        <Link href="/dashboard" className="btn btn-secondary w-fit">← Dashboard</Link>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="meta">Sign in to preview drafts.</p>
        <Link href="/login" className="btn mt-4">Sign in</Link>
      </main>
    );
  }
  const { data: me } = await supabase.from("members").select("id,role").eq("auth_id", user.id).single();
  const { data: post } = await supabase
    .from("posts")
    .select("id,title,deck,content_html,status,author_member_id,members!inner(slug,display_name)")
    .eq("id", id)
    .single();
  if (!post) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="meta">Draft not found (or archived).</p>
        <Link href="/dashboard" className="btn btn-secondary mt-4">← Dashboard</Link>
      </main>
    );
  }
  if (me?.role !== "admin" && post.author_member_id !== me?.id) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="meta" role="alert">You can only preview your own drafts.</p>
        <Link href="/dashboard" className="btn btn-secondary mt-4">← Dashboard</Link>
      </main>
    );
  }
  const slug = Array.isArray(post.members) ? post.members[0]?.slug : (post.members as { slug?: string } | null)?.slug;
  const member = memberBySlug(slug ?? "");
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 flex flex-col gap-6" style={member ? memberStyle(member) : undefined}>
      <p className="meta" role="status">Private preview · {post.status} · not indexed</p>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">{post.title}</h1>
      <p className="lede">{post.deck}</p>
      <div className="prose-measure" dangerouslySetInnerHTML={{ __html: post.content_html || "<p>Empty draft.</p>" }} />
      <Link href="/dashboard" className="btn btn-secondary w-fit">← Dashboard</Link>
    </main>
  );
}
