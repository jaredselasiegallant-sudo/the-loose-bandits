import Link from "next/link";
import { type Member, memberStyle } from "@/lib/members";

export function MemberBadge({ member, size = "md" }: { member: Member; size?: "sm" | "md" }) {
  return (
    <span
      className={`member-badge ${size === "sm" ? "member-badge-sm" : ""}`}
      style={memberStyle(member)}
    >
      <span aria-hidden="true" className="member-avatar">
        {member.initials}
      </span>
      <span className="member-badge-name">{member.name}</span>
      <span aria-hidden="true" className="member-badge-mark">
        {member.mark}
      </span>
    </span>
  );
}

export default function MemberCard({ member }: { member: Member }) {
  return (
    <article className="member-card" style={memberStyle(member)} aria-labelledby={`${member.slug}-name`}>
      <div className="member-card-top" aria-hidden="true" />
      <div className="member-card-body">
        <div className="member-card-row">
          <span className="member-avatar member-avatar-lg" aria-hidden="true">
            {member.initials}
          </span>
          <div>
            <h3 id={`${member.slug}-name`} className="member-card-name">
              {member.name}
            </h3>
            <p className="meta">Author archive · placeholder</p>
          </div>
          <span aria-hidden="true" className="member-mark">
            {member.mark}
          </span>
        </div>
        <p className="member-card-bio">{member.bio}</p>
        <Link href={`/${member.slug}`} className="btn btn-member">
          Read {member.name}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
