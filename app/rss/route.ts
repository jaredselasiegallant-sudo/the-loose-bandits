import { getPublishedPosts } from "@/lib/posts";
import { memberBySlug } from "@/lib/members";

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function GET(): Promise<Response> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const posts = getPublishedPosts();
  const items = posts
    .map((p) => {
      const member = memberBySlug(p.memberSlug);
      const url = `${base}/${p.memberSlug}/${p.slug}`;
      return `    <item>
      <title>${esc(p.title)} — ${esc(member?.name ?? p.memberSlug)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(p.deck)}</description>
    </item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>The Loose Bandits — family blog (placeholder)</title>
    <link>${base}</link>
    <description>Placeholder feed. Real essays to be supplied by the founder.</description>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
