"use client";

import { useState } from "react";
import { validateMember, type MemberInput } from "@/lib/validation";
import { SaveStatus, useUnsavedWarning, type SaveState } from "./save-state";

export interface MemberRow extends MemberInput {
  slug: string;
}

/** Admin edits everyone incl. colors; members edit own name/bio/avatar only. */
export default function MemberForms({
  rows,
  isAdmin,
  ownSlug,
}: {
  rows: MemberRow[];
  isAdmin: boolean;
  ownSlug: string | null;
}) {
  const [values, setValues] = useState<Record<string, MemberRow>>(
    Object.fromEntries(rows.map((r) => [r.slug, r]))
  );
  const [state, setState] = useState<SaveState>("saved");
  const [msg, setMsg] = useState("");
  const dirty = JSON.stringify(values) !== JSON.stringify(Object.fromEntries(rows.map((r) => [r.slug, r])));
  useUnsavedWarning(dirty);

  const editable = (slug: string): boolean => isAdmin || slug === ownSlug;

  const saveOne = async (slug: string) => {
    const v = values[slug];
    const errs = validateMember(v);
    if (errs.length > 0) {
      setMsg(`${slug}: ${errs[0].message}`);
      setState("error");
      return;
    }
    setState("saving");
    try {
      const res = await fetch("/api/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      if (res.status === 503) {
        try {
          localStorage.setItem("bandits-members-override", JSON.stringify(values));
        } catch {
          /* ignore */
        }
        setState("saved");
        setMsg("Saved locally (demo — Supabase not connected).");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setState("error");
        setMsg(body.error ?? "Save failed.");
        return;
      }
      setState("saved");
      setMsg(`Saved ${slug}.`);
    } catch {
      setState("error");
      setMsg("Save failed.");
    }
  };

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {rows.map((r) => {
        const v = values[r.slug];
        const can = editable(r.slug);
        return (
          <fieldset key={r.slug} className="member-card" disabled={!can}>
            <div className="member-card-body">
              <legend className="font-display text-lg font-bold">
                {r.slug} {r.slug === ownSlug && <span className="meta">(you)</span>}
              </legend>
              {!can && <p className="meta">Only the admin can edit this profile.</p>}
              <label className="meta" htmlFor={`${r.slug}-name`}>Name (required)</label>
              <input
                id={`${r.slug}-name`}
                value={v.display_name}
                disabled={!can}
                onChange={(e) => {
                  setValues({ ...values, [r.slug]: { ...v, display_name: e.target.value } });
                  setState("dirty");
                }}
                className="rounded-lg border px-3 py-1.5 text-sm"
              />
              <label className="meta" htmlFor={`${r.slug}-bio`}>Bio (max 600 chars)</label>
              <textarea
                id={`${r.slug}-bio`}
                value={v.bio}
                rows={3}
                disabled={!can}
                onChange={(e) => {
                  setValues({ ...values, [r.slug]: { ...v, bio: e.target.value } });
                  setState("dirty");
                }}
                className="rounded-lg border px-3 py-1.5 text-sm"
              />
              <label className="meta" htmlFor={`${r.slug}-avatar`}>Avatar URL (optional)</label>
              <input
                id={`${r.slug}-avatar`}
                value={v.avatar_url}
                disabled={!can}
                placeholder="https://… or /avatars/….jpg"
                onChange={(e) => {
                  setValues({ ...values, [r.slug]: { ...v, avatar_url: e.target.value } });
                  setState("dirty");
                }}
                className="rounded-lg border px-3 py-1.5 text-sm"
              />
              {(["primary_color", "soft_color", "ink_color", "on_primary_color"] as const).map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <label className="meta" htmlFor={`${r.slug}-${k}`}>
                    {k}
                  </label>
                  <input
                    id={`${r.slug}-${k}`}
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(v[k]) ? v[k] : "#888888"}
                    disabled={!can || !isAdmin}
                    title={isAdmin ? "Admin: pick signature color" : "Only admin can change colors"}
                    onChange={(e) => {
                      setValues({ ...values, [r.slug]: { ...v, [k]: e.target.value } });
                      setState("dirty");
                    }}
                  />
                  <code className="meta">{v[k]}</code>
                </div>
              ))}
              {can && (
                <button type="button" className="btn btn-secondary w-fit" onClick={() => void saveOne(r.slug)}>
                  Save {r.slug}
                </button>
              )}
            </div>
          </fieldset>
        );
      })}
      <div className="md:col-span-2">
        <SaveStatus state={state} message={msg} />
      </div>
    </div>
  );
}
