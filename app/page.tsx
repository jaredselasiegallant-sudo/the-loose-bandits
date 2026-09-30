import Link from "next/link";
import MemberCard from "@/components/MemberCard";
import PostCard from "@/components/PostCard";
import Sticker from "@/components/Sticker";
import { MEMBERS, memberBySlug, memberStyle } from "@/lib/members";
import { FORMAT_LABEL, allFormats, allTopics, getPublishedPosts } from "@/lib/posts";

import { getSiteSettingsServer } from "@/lib/site-server";

export default async function Home() {
  const settings = await getSiteSettingsServer();
  const posts = getPublishedPosts();
  const featured = posts[0];
  const featuredMember = memberBySlug(featured.memberSlug)!;
  const latest = posts.slice(1, 5);
  const topics = allTopics();
  const formats = allFormats();

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 flex flex-col gap-12">
      {/* 1 — striking editorial feature with robust no-image fallback */}
      <section className="hero" aria-labelledby="hero-title" style={memberStyle(featuredMember)}>
        <div className="flex flex-wrap items-center gap-3">
          <Sticker kind="stamp">Featured · placeholder</Sticker>
          <span className="meta">
            {FORMAT_LABEL[featured.format]} · {featuredMember.name} · {featured.readingMinutes} min
          </span>
        </div>
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center mt-4">
          <div>
            <h1
              id="hero-title"
              className="font-display font-extrabold leading-[0.95] tracking-tight text-[clamp(2.4rem,6vw,4.8rem)]"
            >
              {settings.hero_headline}
            </h1>
            <p className="lede mt-4">{settings.hero_deck}</p>
            <p className="mt-3 text-sm opacity-80">{settings.home_intro}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/${featured.memberSlug}/${featured.slug}`} className="btn btn-member">
                {settings.cta_primary} <span aria-hidden="true">→</span>
              </Link>
              <Link href={`/${featured.memberSlug}`} className="btn btn-secondary">
                {settings.cta_secondary}: {featuredMember.name}
              </Link>
            </div>
          </div>
          {/* Group/family image collage placeholder — survives with no image */}
          <div
            className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center"
            role="img"
            aria-label="Placeholder for group/family collage. No real photo supplied yet."
          >
            <span className="font-display text-2xl" aria-hidden="true">
              ◧ ◨ ◩
            </span>
            <p className="meta">Group collage placeholder</p>
            <p className="text-sm opacity-70">
              Founder to supply photo. Layout holds without it.
            </p>
          </div>
        </div>
      </section>

      {/* 2 — four member cards as a unified set */}
      <section id="members" aria-labelledby="members-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="meta">One publication · four signatures</p>
            <h2 id="members-title" className="font-display text-3xl font-extrabold tracking-tight">
              Read by writer
            </h2>
          </div>
          <Sticker kind="tape" rotate={2}>
            Color + name + initials — never color alone
          </Sticker>
        </div>
        <div className="member-grid">
          {MEMBERS.map((m) => (
            <MemberCard key={m.slug} member={m} />
          ))}
        </div>
      </section>

      {/* 3 — curated latest feed */}
      <section aria-labelledby="latest-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="latest-title" className="font-display text-3xl font-extrabold tracking-tight">
            Latest essays
          </h2>
          <span className="meta">Placeholders · newest first</span>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {latest.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      </section>

      {/* 4 — browse paths only for existing content */}
      <section aria-labelledby="browse-title" className="rule-tape pt-8 grid gap-6 md:grid-cols-3">
        <h2 id="browse-title" className="sr-only">
          Browse
        </h2>
        <div>
          <p className="meta">By writer</p>
          <ul className="mt-2 flex flex-col gap-1">
            {MEMBERS.map((m) => (
              <li key={m.slug}>
                <Link href={`/${m.slug}`} className="hover:underline">
                  {m.name} <span aria-hidden="true" style={{ color: m.theme.primary }}>●</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="meta">By topic</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {topics.map((t) => (
              <li key={t}>
                <span className="sticker sticker-tape">{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="meta">By format</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {formats.map((f) => (
              <li key={f}>
                <span className="sticker">{FORMAT_LABEL[f]}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
