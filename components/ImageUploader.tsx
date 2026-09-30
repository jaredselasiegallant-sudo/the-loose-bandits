"use client";

import { useRef, useState } from "react";
import { MAX_PER_POST, validateImageFile } from "@/lib/images";
import { createClient } from "@/lib/supabase/client";

interface Staged {
  name: string;
  url: string;
  alt: string;
  caption: string;
  progress: number;
  error?: string;
}

/**
 * Upload control with drag-and-drop, alt/caption fields, progress + errors.
 * Uses Supabase Storage when configured; otherwise stages locally for preview
 * so the authoring UX is testable without secrets.
 */
export default function ImageUploader() {
  const supabase = createClient();
  const [items, setItems] = useState<Staged[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (items.length + list.length > MAX_PER_POST) {
      alert(`Max ${MAX_PER_POST} images per post (density guard).`);
      return;
    }
    for (const file of list) {
      const v = validateImageFile(file);
      const url = URL.createObjectURL(file);
      const entry: Staged = {
        name: file.name,
        url,
        alt: "",
        caption: "",
        progress: 0,
        error: v.ok ? undefined : v.error,
      };
      setItems((prev) => [...prev, entry]);
      if (!v.ok) continue;
      // Simulated progress; real upload replaces this when Supabase is wired.
      if (!supabase) {
        setItems((prev) => prev.map((it) => (it.url === url ? { ...it, progress: 100 } : it)));
        continue;
      }
      try {
        const path = `${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("bandit-images").upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
        setItems((prev) =>
          prev.map((it) =>
            it.url === url ? { ...it, progress: 100, error: error?.message } : it
          )
        );
      } catch (e) {
        setItems((prev) =>
          prev.map((it) =>
            it.url === url ? { ...it, error: e instanceof Error ? e.message : "Upload failed" } : it
          )
        );
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop images here or press Enter to browse"
        onKeyDown={(e) => {
          if (e.key === "Enter") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-6 text-center ${
          dragOver ? "border-solid" : ""
        }`}
      >
        <span className="font-display font-bold">Drop images or click to browse</span>
        <span className="meta">JPG/PNG/WebP/AVIF · max 8MB · {MAX_PER_POST} per post</span>
        {!supabase && <span className="meta">Preview mode — Supabase not configured</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="sr-only"
        aria-label="Choose images"
        onChange={(e) => {
          if (e.target.files) void addFiles(e.target.files);
        }}
      />
      <ul className="grid gap-4 md:grid-cols-2">
        {items.map((it) => (
          <li key={it.url} className="member-card">
            <div className="member-card-body">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.url}
                alt={it.alt || `Preview of ${it.name} (alt text still needed)`}
                className="h-36 w-full rounded-lg object-cover"
                loading="lazy"
              />
              <p className="meta">
                {it.name} · {it.progress}%{it.error ? ` · Error: ${it.error}` : ""}
              </p>
              <progress value={it.progress} max={100} aria-label={`Upload progress for ${it.name}`} className="w-full" />
              <label className="meta" htmlFor={`alt-${it.url}`}>
                Alt text (required)
              </label>
              <input
                id={`alt-${it.url}`}
                value={it.alt}
                onChange={(e) =>
                  setItems((prev) => prev.map((p) => (p.url === it.url ? { ...p, alt: e.target.value } : p)))
                }
                placeholder="Describe the photo for screen readers"
                className="rounded-lg border px-3 py-1.5 text-sm"
              />
              <label className="meta" htmlFor={`cap-${it.url}`}>
                Caption
              </label>
              <input
                id={`cap-${it.url}`}
                value={it.caption}
                onChange={(e) =>
                  setItems((prev) => prev.map((p) => (p.url === it.url ? { ...p, caption: e.target.value } : p)))
                }
                placeholder="Optional caption"
                className="rounded-lg border px-3 py-1.5 text-sm"
              />
              <button
                type="button"
                className="btn btn-secondary w-fit"
                onClick={() => setItems((prev) => prev.filter((p) => p.url !== it.url))}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
