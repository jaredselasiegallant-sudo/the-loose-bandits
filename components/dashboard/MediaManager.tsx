"use client";

import { useState } from "react";
import ImageUploader from "../ImageUploader";
import { SaveStatus, type SaveState } from "./save-state";

export interface MediaRow {
  id: string;
  display_name: string;
  alt_text: string;
  caption: string;
  tags: string;
  usedBy: string[];
  archived: boolean;
}

export default function MediaManager({ initial }: { initial: MediaRow[] }) {
  const [rows, setRows] = useState<MediaRow[]>(initial);
  const [state, setState] = useState<SaveState>("saved");
  const [msg, setMsg] = useState("");

  const saveRow = async (row: MediaRow) => {
    if (!row.alt_text.trim()) {
      setMsg(`${row.display_name}: alt text is required.`);
      setState("error");
      return;
    }
    setState("saving");
    try {
      const res = await fetch("/api/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      if (res.status === 503 || res.ok) {
        if (res.status === 503) {
          try {
            localStorage.setItem("bandits-media-override", JSON.stringify(rows));
          } catch {
            /* ignore */
          }
        }
        setState("saved");
        setMsg(`Saved ${row.display_name}.`);
        return;
      }
      const body = await res.json().catch(() => ({}));
      setState("error");
      setMsg(body.error ?? "Save failed.");
    } catch {
      setState("error");
      setMsg("Save failed.");
    }
  };

  const archiveRow = async (row: MediaRow) => {
    const warn =
      row.usedBy.length > 0
        ? `“${row.display_name}” is used by ${row.usedBy.join(", ")}. Archiving keeps pages working with a placeholder frame — delete nothing silently. Continue?`
        : `Archive “${row.display_name}”? It stays recoverable.`;
    if (!window.confirm(warn)) return;
    setState("saving");
    try {
      const res = await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
      });
      if (res.status === 503 || res.ok) {
        const next = rows.map((r) => (r.id === row.id ? { ...r, archived: true } : r));
        setRows(next);
        try {
          localStorage.setItem("bandits-media-override", JSON.stringify(next));
        } catch {
          /* ignore */
        }
        setState("saved");
        setMsg(`Archived ${row.display_name}. Replace it wherever it is used before permanent removal.`);
        return;
      }
      const body = await res.json().catch(() => ({}));
      setState("error");
      setMsg(body.error ?? "Archive failed.");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="upload-h">
        <h3 id="upload-h" className="font-display text-lg font-bold">Upload (JPEG/PNG/WebP/AVIF · 8MB)</h3>
        <ImageUploader />
      </section>
      <section aria-labelledby="library-h" className="flex flex-col gap-3">
        <h3 id="library-h" className="font-display text-lg font-bold">Library</h3>
        {rows.length === 0 && <p className="meta">No assets yet. Uploaded files appear here with usage info.</p>}
        <ul className="grid gap-4 md:grid-cols-2">
          {rows.map((row) => (
            <li key={row.id} className="member-card">
              <div className="member-card-body">
                <p className="font-bold">
                  {row.display_name} {row.archived && <span className="sticker sticker-tape">Archived</span>}
                </p>
                <p className="meta">
                  {row.usedBy.length > 0 ? `Used by: ${row.usedBy.join(", ")}` : "Not used by any post/profile yet"}
                </p>
                <label className="meta" htmlFor={`${row.id}-alt`}>Alt text (required)</label>
                <input
                  id={`${row.id}-alt`}
                  value={row.alt_text}
                  onChange={(e) => setRows(rows.map((r) => (r.id === row.id ? { ...r, alt_text: e.target.value } : r)))}
                  className="rounded-lg border px-3 py-1.5 text-sm"
                />
                <label className="meta" htmlFor={`${row.id}-cap`}>Caption</label>
                <input
                  id={`${row.id}-cap`}
                  value={row.caption}
                  onChange={(e) => setRows(rows.map((r) => (r.id === row.id ? { ...r, caption: e.target.value } : r)))}
                  className="rounded-lg border px-3 py-1.5 text-sm"
                />
                <label className="meta" htmlFor={`${row.id}-tags`}>Tags (comma separated — reuse across posts)</label>
                <input
                  id={`${row.id}-tags`}
                  value={row.tags}
                  onChange={(e) => setRows(rows.map((r) => (r.id === row.id ? { ...r, tags: e.target.value } : r)))}
                  className="rounded-lg border px-3 py-1.5 text-sm"
                />
                <div className="flex gap-2">
                  <button type="button" className="btn btn-secondary w-fit" onClick={() => void saveRow(row)}>
                    Save
                  </button>
                  {!row.archived && (
                    <button type="button" className="btn btn-secondary w-fit" onClick={() => void archiveRow(row)}>
                      Archive…
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <SaveStatus state={state} message={msg} />
        <p className="meta">Transparent stickers: PNG/WebP and sanitized SVG only. No executables. Public images serve optimized sizes; originals stay private.</p>
      </section>
    </div>
  );
}
