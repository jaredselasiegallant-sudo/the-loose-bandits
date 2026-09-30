import Link from "next/link";
import { notFound } from "next/navigation";
import MemberArchive from "@/components/MemberArchive";
import Sticker from "@/components/Sticker";
import { MEMBERS, memberBySlug, memberStyle } from "@/lib/members";
import { getPostsByMember } from "@/lib/posts";

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ member: m.slug }));
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ member: string }>;
}) {
  const { member: slug } = await params;
  const member = memberBySlug(slug);
  if (!member) notFound();
  const posts = getPostsByMember(slug);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 flex flex-col gap-8" style={memberStyle(member)}>
      {/* color-coded masthead/nameplate — shared layout, member accents only */}
      <section
        aria-labelledby="member-name"
        className="hero"
        style={{ borderColor: member.theme.primary }}
      >
        <div className="member-card-top -mx-[clamp(1.5rem,4vw,3rem)] -mt-[clamp(1.5rem,4vw,3rem)] mb-6" aria-hidden="true" />
        <div className="flex flex-wrap items-center gap-4">
          <span className="member-avatar member-avatar-lg" aria-hidden="true" style={{ width: "4rem", height: "4rem", fontSize: "1rem" }}>
            {member.initials}
          </span>
          <div>
            <p className="meta">Author archive · placeholder</p>
            <h1 id="member-name" className="font-display text-4xl font-extrabold tracking-tight">
              {member.name}
            </h1>
          </div>
          <Sticker kind="star" rotate={5}>
            {member.mark}
          </Sticker>
        </div>
        <p className="lede mt-4">{member.bio}</p>
        <p className="meta mt-2">
          Signature color is an accent only — identity also uses name, initials, and labels.
        </p>
      </section>

      <section aria-labelledby="posts-title" className="flex flex-col gap-4">
        <h2 id="posts-title" className="font-display text-2xl font-bold">
          All posts by {member.name}
        </h2>
        <MemberArchive posts={posts} />
      </section>

      <nav aria-label="Back to publication">
        <Link href="/" className="btn btn-secondary">
          ← All writers
        </Link>
      </nav>
    </main>
  );
}
