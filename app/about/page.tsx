import Link from "next/link";
import { MEMBERS } from "@/lib/members";
import { MemberBadge } from "@/components/MemberCard";

import { getSiteSettingsServer } from "@/lib/site-server";

export default async function AboutPage() {
  const settings = await getSiteSettingsServer();
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 flex flex-col gap-8">
      <div className="prose-measure">
        <p className="meta">About · editable placeholder (no invented lore)</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          Four voices, one paper table.
        </h1>
        <p className="lede mt-4">{settings.about_copy}</p>
      </div>
      <ul className="member-grid">
        {MEMBERS.map((m) => (
          <li
            key={m.slug}
            className="member-card"
            style={
              {
                "--member-primary": m.theme.primary,
                "--member-soft": m.theme.soft,
                "--member-ink": m.theme.ink,
                "--member-on-primary": m.theme.onPrimary,
              } as React.CSSProperties
            }
          >
            <div className="member-card-top" aria-hidden="true" />
            <div className="member-card-body">
              <MemberBadge member={m} size="sm" />
              <p className="member-card-bio">{m.bio}</p>
              <Link href={`/${m.slug}`} className="btn btn-member w-fit">
                Read {m.name} →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
