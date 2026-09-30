"use client";

import { useState } from "react";
import Link from "next/link";
import SiteTextForm from "./SiteTextForm";
import MemberForms, { type MemberRow } from "./MemberForms";
import PostsManager, { type DashboardPost } from "./PostsManager";
import MediaManager, { type MediaRow } from "./MediaManager";
import type { SiteSettingsInput } from "@/lib/validation";
import { MAX_BYTES, MAX_PER_POST } from "@/lib/images";
import { MAX_STICKERS_PER_POST } from "@/lib/stickers";

type Tab = "posts" | "pages" | "members" | "media" | "settings";

export default function DashboardTabs({
  settings,
  members,
  posts,
  media,
  isAdmin,
  ownSlug,
}: {
  settings: SiteSettingsInput;
  members: MemberRow[];
  posts: DashboardPost[];
  media: MediaRow[];
  isAdmin: boolean;
  ownSlug: string | null;
}) {
  const [tab, setTab] = useState<Tab>("posts");
  const tabs: Array<{ id: Tab; label: string; adminOnly?: boolean }> = [
    { id: "posts", label: "Posts" },
    { id: "pages", label: "Pages & site text" },
    { id: "members", label: "Members", adminOnly: true },
    { id: "media", label: "Media" },
    { id: "settings", label: "Settings", adminOnly: true },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Dashboard sections">
        {tabs.map((t) => {
          if (t.adminOnly && !isAdmin) return null;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`btn ${tab === t.id ? "" : "btn-secondary"}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "posts" && (
        <section aria-label="Posts">
          <PostsManager initial={posts} canEditAll={isAdmin} ownSlug={ownSlug} />
        </section>
      )}
      {tab === "pages" && (
        <section aria-label="Pages and site text">
          <SiteTextForm initial={settings} isAdmin={isAdmin} />
        </section>
      )}
      {tab === "members" && isAdmin && (
        <section aria-label="Members" className="flex flex-col gap-4">
          <MemberForms rows={members} isAdmin={isAdmin} ownSlug={ownSlug} />
          <p className="meta">
            Invites are admin-only and never public. <Link href="/admin/invites" className="hover:underline">Invite a member →</Link>
          </p>
        </section>
      )}
      {tab === "media" && (
        <section aria-label="Media">
          <MediaManager initial={media} />
        </section>
      )}
      {tab === "settings" && isAdmin && (
        <section aria-label="Settings" className="hero flex flex-col gap-3">
          <p className="meta">Upload limits & visibility</p>
          <ul className="list-disc pl-6 text-sm">
            <li>Images: JPEG/PNG/WebP/AVIF, max {(MAX_BYTES / 1048576).toFixed(0)}MB each, {MAX_PER_POST} per post.</li>
            <li>Stickers: PNG/WebP + sanitized SVG only, max {MAX_STICKERS_PER_POST} per post.</li>
            <li>Drafts, schedules, previews, and admin materials stay private; only published posts and their cover media are public.</li>
            <li>Roles come from the database, never the browser. RLS enforces them even if the UI is bypassed.</li>
          </ul>
          <div className="flex gap-2">
            <Link href="/admin/invites" className="btn w-fit">Invite members</Link>
            <Link href="/" className="btn btn-secondary w-fit">← Back to public site</Link>
          </div>
        </section>
      )}
    </div>
  );
}
