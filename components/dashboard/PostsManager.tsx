"use client";

import { useState } from "react";
import Link from "next/link";
import { validatePost } from "@/lib/validation";
import { isPlaceholderCopy } from "@/lib/site";
import { SaveStatus, useUnsavedWarning, type SaveState } from "./save-state";

export interface DashboardPost {
  id: string;
  slug: string;
  memberSlug: string;
  title: string;
  deck: string;
  excerpt: string;
  format: string;
  status: "draft" | "published" | "scheduled" | string;
  scheduled_for: string;
  seo_title: string;
  seo_description: string;
  updated_at: string;
}

const STATUSES = ["draft", "published", "scheduled"] as const;
const FORMATS = ["essay", "field-note", "family-lore", "four-takes", "photo-evidence"] as const;

export default function PostsManager({
  initial,
  canEditAll,
  ownSlug,
}: {
  initial: DashboardPost[];
  canEditAll: boolean;
  ownSlug: string | null;
}) {
  const [posts, setPosts] = useState<DashboardPost[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);
  const [state, setState] = useState<SaveState>("saved");
  const [msg, setMsg] = useState("");
  const selected = posts.find((p) => p.id === selectedId) ?? null;
  const [draft, setDraft] = useState<DashboardPost | null>(selected);
  const dirty = JSON.stringify(draft) !== JSON.stringify(selected);
  useUnsavedWarning(dirty);

  const pick = (id: string) => {
    if (dirty && !window.confirm("Discard unsaved changes to this post?")) return;
    const p = posts.find((x) => x.id === id) ?? null;
    setSelectedId(id);
    setDraft(p);
    setState("saved");
    setMsg("");
  };

  const canEdit = (p: DashboardPost): boolean => canEditAll || (ownSlug !== null && p.memberSlug === ownSlug);

  const persist = async (next: DashboardPost, action: string): Promise<boolean> => {
    const errs = validatePost({
      title: next.title,
      deck: next.deck,
      excerpt: next.excerpt,
      format: next.format,
      status: next.status,
      slug: next.slug,
      seo_title: next.seo_title,
      seo_description: next.seo_description,
    });
    if (errs.length > 0) {
      setMsg(`${action}: ${errs[0].field} — ${errs[0].message}`);
      setState("error");
      return false;
    }
    setState("saving");
    try {
      const res = await fetch("/api/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...next, _action: action }),
      });
      if (res.status === 503) {
        try {
          localStorage.setItem("bandits-posts-override", JSON.stringify(posts.map((p) => (p.id === next.id ? next : p))));
        } catch {
          /* ignore */
        }
        setPosts(posts.map((p) => (p.id === next.id ? next : p)));
        setState("saved");
        setMsg(`${action} saved locally (demo).`);
        return true;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setState("error");
        setMsg(body.error ?? `${action} failed.`);
        return false;
      }
      setPosts(posts.map((p) => (p.id === next.id ? next : p)));
      setState("saved");
      setMsg(`${action} — saved.`);
      return true;
    } catch {
      setState("error");
      setMsg(`${action} failed.`);
      return false;
    }
  };

  const archive = async () => {
    if (!selected || !draft) return;
    if (!window.confirm(`Archive “${selected.title}”? It leaves public feeds but stays recoverable in the dashboard.`)) return;
    setState("saving");
    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id }),
      });
      if (res.status === 503 || res.ok) {
        const remaining = posts.filter((p) => p.id !== selected.id);
        try {
          localStorage.setItem("bandits-posts-override", JSON.stringify(remaining));
        } catch {
          /* ignore */
        }
        setPosts(remaining);
        setSelectedId(remaining[0]?.id ?? null);
        setDraft(remaining[0] ?? null);
        setState("saved");
        setMsg("Archived. Unpublishing removed it from public feeds; it stays recoverable.");
        return;
      }
      const body = await res.json().catch(() => ({}));
      setState("error");
      setMsg(body.error ?? "Archive failed.");
    } catch {
      setState("error");
    }
  };

  const createNew = () => {
    if (!ownSlug && !canEditAll) return;
    const p: DashboardPost = {
      id: `local-${Date.now()}`,
      slug: "todo-new-post",
      memberSlug: ownSlug ?? "member-1",
      title: "TODO: new post title",
      deck: "TODO deck",
      excerpt: "TODO excerpt",
      format: "essay",
      status: "draft",
      scheduled_for: "",
      seo_title: "",
      seo_description: "",
      updated_at: new Date().toISOString(),
    };
    setPosts([p, ...posts]);
    setSelectedId(p.id);
    setDraft(p);
    setMsg("New draft started. Private until published.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div>
        <button type="button" className="btn w-fit" onClick={createNew}>
          + New post
        </button>
        <ul className="mt-4 flex flex-col gap-2" aria-label="Posts">
          {posts.length === 0 && <li className="meta">No posts yet — start one above.</li>}
          {posts.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => pick(p.id)}
                aria-pressed={p.id === selectedId}
                className={`w-full rounded-xl border-2 p-3 text-left ${p.id === selectedId ? "border-solid" : "border-dashed"}`}
              >
                <span className="font-bold">{p.title}</span>{" "}
                {isPlaceholderCopy(p.title) && <span className="sticker sticker-tape">Placeholder</span>}
                <br />
                <span className="meta">
                  {p.status} · {p.memberSlug} · {p.format}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {!selected || !draft ? (
        <p className="lede">Select a post to edit.</p>
      ) : (
        <form
          className="flex flex-col gap-4"
          aria-label="Post editor"
          onSubmit={(e) => {
            e.preventDefault();
            void persist(draft, "Save draft");
          }}
        >
          {!canEdit(selected) && <p className="meta" role="note">You can only edit your own posts. Ask the admin for access.</p>}
          <fieldset disabled={!canEdit(selected)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-bold" htmlFor="post-title">Title (required)</label>
              <input
                id="post-title"
                value={draft.title}
                onChange={(e) => {
                  setDraft({ ...draft, title: e.target.value });
                  setState("dirty");
                }}
                className="rounded-xl border-2 border-[var(--foreground)] bg-transparent px-4 py-2"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="font-bold" htmlFor="post-slug">Slug</label>
                <input
                  id="post-slug"
                  value={draft.slug}
                  onChange={(e) => {
                    setDraft({ ...draft, slug: e.target.value });
                    setState("dirty");
                  }}
                  className="rounded-xl border px-3 py-1.5 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold" htmlFor="post-format">Format</label>
                <select
                  id="post-format"
                  value={draft.format}
                  onChange={(e) => {
                    setDraft({ ...draft, format: e.target.value });
                    setState("dirty");
                  }}
                  className="rounded-xl border px-3 py-1.5 text-sm"
                >
                  {FORMATS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
            {(
              [
                ["deck", "Subtitle / deck"],
                ["excerpt", "Excerpt"],
                ["seo_title", "SEO title"],
                ["seo_description", "SEO description"],
              ] as Array<[keyof DashboardPost, string]>
            ).map(([k, label]) => (
              <div key={k} className="flex flex-col gap-1">
                <label className="font-bold" htmlFor={`post-${k}`}>{label}</label>
                <input
                  id={`post-${k}`}
                  value={String(draft[k] ?? "")}
                  onChange={(e) => {
                    setDraft({ ...draft, [k]: e.target.value });
                    setState("dirty");
                  }}
                  className="rounded-xl border px-3 py-1.5 text-sm"
                />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="font-bold" htmlFor="post-schedule">Schedule for (optional)</label>
              <input
                id="post-schedule"
                type="datetime-local"
                value={draft.scheduled_for}
                onChange={(e) => {
                  setDraft({ ...draft, scheduled_for: e.target.value });
                  setState("dirty");
                }}
                className="rounded-xl border px-3 py-1.5 text-sm"
              />
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Publish actions">
            <button type="submit" className="btn">Save draft</button>
            <Link href={`/preview/${selected.id}`} className="btn btn-secondary">Preview (private)</Link>
            <Link href="/write" className="btn btn-secondary">Open full editor</Link>
            {STATUSES.filter((s) => s !== "draft").map((s) => (
              <button
                key={s}
                type="button"
                className="btn btn-secondary"
                disabled={!canEdit(selected)}
                onClick={() => void persist({ ...draft, status: s }, s === "published" ? "Publish" : "Schedule")}
              >
                {s === "published" ? "Publish" : "Schedule"}
              </button>
            ))}
            {selected.status === "published" && (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!canEdit(selected)}
                onClick={() => void persist({ ...draft, status: "draft" }, "Unpublish")}
              >
                Unpublish
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              disabled={!canEdit(selected)}
              onClick={() => void archive()}
            >
              Archive…
            </button>
          </div>
          <SaveStatus state={dirty && state === "saved" ? "dirty" : state} message={msg} />
          <p className="meta">Drafts stay private until published. Unpublishing removes a post from feeds, sitemap, and RSS; archiving keeps it recoverable here.</p>
        </form>
      )}
    </div>
  );
}
