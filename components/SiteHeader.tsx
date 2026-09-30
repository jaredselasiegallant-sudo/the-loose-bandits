import Link from "next/link";
import AuthHeader from "./AuthHeader";
import { MEMBERS } from "@/lib/members";
import { getSiteSettingsServer } from "@/lib/site-server";

export default async function SiteHeader() {
  const settings = await getSiteSettingsServer();
  const [first, ...rest] = settings.wordmark_text.split(" ");
  return (
    <header className="site-header">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
        <Link href="/" className="wordmark" aria-label={`${settings.wordmark_text} home`}>
          {first} <span className="wordmark-accent">{rest.join(" ") || "Bandits"}</span>
          <span className="wordmark-tag" aria-hidden="true">
            family blog · placeholder
          </span>
        </Link>
        <nav aria-label="Primary" className="ml-auto flex flex-wrap items-center gap-2">
          <Link href="/" className="nav-link">
            Home
          </Link>
          {MEMBERS.map((m) => (
            <Link
              key={m.slug}
              href={`/${m.slug}`}
              className="nav-link nav-link-member"
              style={
                {
                  "--member-primary": m.theme.primary,
                } as React.CSSProperties
              }
            >
              <span aria-hidden="true" className="nav-dot" />
              {m.name}
              <span className="sr-only">(author archive placeholder)</span>
            </Link>
          ))}
          <Link href="/about" className="nav-link">
            About
          </Link>
          <AuthHeader />
        </nav>
      </div>
      <div className="member-band" aria-hidden="true">
        {MEMBERS.map((m) => (
          <span key={m.slug} style={{ background: m.theme.primary }} />
        ))}
      </div>
    </header>
  );
}
