import Link from "next/link";
import { memberBySlug, memberStyle } from "@/lib/members";
import { FORMAT_LABEL, formatDate, type PlaceholderPost } from "@/lib/posts";
import { MemberBadge } from "./MemberCard";

export default function PostCard({ post }: { post: PlaceholderPost }) {
  const member = memberBySlug(post.memberSlug)!;
  return (
    <article
      aria-labelledby={`${post.slug}-title`}
      className="member-card"
      style={memberStyle(member)}
    >
      <div className="member-card-top" aria-hidden="true" />
      <div className="member-card-body">
        <div className="flex flex-wrap items-center gap-2">
          <MemberBadge member={member} size="sm" />
          <span className="meta">
            {FORMAT_LABEL[post.format]} · {formatDate(post.date)} · {post.readingMinutes} min
          </span>
        </div>
        <h3 id={`${post.slug}-title`} className="font-display text-xl font-bold leading-tight">
          <Link href={`/${post.memberSlug}/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h3>
        <p className="member-card-bio">{post.deck}</p>
        {/* Cover placeholder frame — real photo ships with founder assets */}
        <div
          className="flex h-28 items-center justify-center rounded-lg border-2 border-dashed text-center"
          style={{ borderColor: member.theme.primary }}
          role="img"
          aria-label={post.coverAlt}
        >
          <span className="meta">Cover placeholder · {post.coverAlt}</span>
        </div>
        <Link href={`/${post.memberSlug}/${post.slug}`} className="btn btn-member w-fit">
          Read essay <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
