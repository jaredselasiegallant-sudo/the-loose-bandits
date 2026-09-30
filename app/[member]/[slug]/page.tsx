import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Sticker from "@/components/Sticker";
import { MemberBadge } from "@/components/MemberCard";
import PostCard from "@/components/PostCard";
import { MEMBERS, memberBySlug, memberStyle } from "@/lib/members";
import {
  FORMAT_LABEL,
  PLACEHOLDER_POSTS,
  formatDate,
  getPost,
  getPostsByMember,
  getPublishedPosts,
} from "@/lib/posts";

export function generateStaticParams() {
  return PLACEHOLDER_POSTS.map((p) => ({ member: p.memberSlug, slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ member: string; slug: string }>;
}): Promise<Metadata> {
  const { member: memberSlug, slug } = await params;
  const post = getPost(memberSlug, slug);
  const member = memberBySlug(memberSlug);
  if (!post || !member) return { title: "Not found" };
  const title = `${post.title} · ${member.name}`;
  const description = post.deck;
  return {
    title,
    description,
    authors: [{ name: member.name }],
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.date,
      authors: [member.name],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ member: string; slug: string }>;
}) {
  const { member: memberSlug, slug } = await params;
  const post = getPost(memberSlug, slug);
  const member = memberBySlug(memberSlug);
  if (!post || !member) notFound();

  const memberPosts = getPostsByMember(memberSlug).filter((p) => p.slug !== slug);
  const idx = getPublishedPosts().findIndex((p) => p.slug === slug && p.memberSlug === memberSlug);
  const all = getPublishedPosts();
  const prev = all[idx + 1];
  const next = all[idx - 1];
  const related = memberPosts.slice(0, 2);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10" style={memberStyle(member)}>
      <nav aria-label="Breadcrumb" className="meta flex flex-wrap gap-2">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/${memberSlug}`} className="hover:underline">
          {member.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{FORMAT_LABEL[post.format]}</span>
      </nav>

      <article aria-labelledby="essay-title" className="mt-6 grid gap-8 lg:grid-cols-[1fr_220px]">
        <div className="prose-measure">
          <div className="flex flex-wrap items-center gap-2">
            <MemberBadge member={member} size="sm" />
            <span className="meta">
              {formatDate(post.date)} · {post.readingMinutes} min · {FORMAT_LABEL[post.format]}
            </span>
          </div>
          <h1 id="essay-title" className="font-display font-extrabold tracking-tight leading-[1.02] text-[clamp(2rem,5vw,3.8rem)] mt-4">
            {post.title}
          </h1>
          <p className="lede mt-3">{post.deck}</p>

          <div className="mt-6 flex flex-col gap-5">
            {post.body.map((block, i) => {
              if (block.type === "h2")
                return (
                  <h2 key={i} className="font-display text-2xl font-bold mt-4">
                    {block.text}
                  </h2>
                );
              if (block.type === "quote")
                return (
                  <blockquote
                    key={i}
                    className="border-l-4 pl-4 font-display text-xl italic"
                    style={{ borderColor: member.theme.primary }}
                  >
                    “{block.text}”
                  </blockquote>
                );
              if (block.type === "list")
                return (
                  <ul key={i} className="list-disc pl-6 flex flex-col gap-1">
                    {block.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                );
              if (block.type === "image")
                return (
                  <figure key={i} className="flex flex-col gap-2">
                    <div
                      className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed text-center"
                      role="img"
                      aria-label={block.alt}
                    >
                      <span className="meta px-4">Image placeholder · {block.alt}</span>
                    </div>
                    <figcaption className="text-sm opacity-80">{block.caption}</figcaption>
                  </figure>
                );
              return <p key={i} className="leading-[1.75]">{block.text}</p>;
            })}
          </div>

          <hr className="rule-tape my-8" />

          <nav aria-label="More stories" className="flex flex-wrap gap-3">
            {prev && (
              <Link href={`/${prev.memberSlug}/${prev.slug}`} className="btn btn-secondary">
                ← Prev: {FORMAT_LABEL[prev.format]}
              </Link>
            )}
            {next && (
              <Link href={`/${next.memberSlug}/${next.slug}`} className="btn btn-secondary">
                Next: {FORMAT_LABEL[next.format]} →
              </Link>
            )}
            <Link href={`/${memberSlug}`} className="btn btn-member">
              Back to {member.name} →
            </Link>
          </nav>
        </div>

        {/* margin annotations — never cover body text, collapse on small screens */}
        <aside aria-label="Marginalia placeholders" className="hidden lg:flex flex-col gap-3 lg:sticky lg:top-24 h-fit">
          <Sticker kind="tape" rotate={-3}>
            {FORMAT_LABEL[post.format]}
          </Sticker>
          <Sticker kind="note" rotate={2}>
            margin note placeholder — points at a detail, never covers text
          </Sticker>
          <Sticker kind="stamp" rotate={-5}>
            {member.mark} {member.name}
          </Sticker>
          <div className="meta">Topics: {post.topics.join(", ")}</div>
        </aside>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-12 flex flex-col gap-4">
          <h2 id="related-title" className="font-display text-2xl font-bold">
            Related by {member.name}
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

// Keep unused import referenced for future four-takes cross-linking
export const _memberSlugsForCrosslinks = MEMBERS.map((m) => m.slug);
