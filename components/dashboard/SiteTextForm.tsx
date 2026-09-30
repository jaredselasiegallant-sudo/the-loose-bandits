"use client";

import { useState } from "react";
import { isPlaceholderCopy, setLocalSettingsOverride } from "@/lib/site";
import { validateSiteSettings, type SiteSettingsInput } from "@/lib/validation";
import { SaveStatus, useUnsavedWarning, type SaveState } from "./save-state";

const FIELDS: Array<{ key: keyof SiteSettingsInput; label: string; hint: string; textarea?: boolean }> = [
  { key: "site_title", label: "Site title / wordmark text", hint: "Shown in header and browser tab. Example: The Loose Bandits" },
  { key: "hero_headline", label: "Hero headline", hint: "Big home-page line. Example: Four voices, one paper table.", textarea: true },
  { key: "hero_deck", label: "Hero deck (subtitle)", hint: "One sentence under the headline.", textarea: true },
  { key: "home_intro", label: "Home-page introduction", hint: "Short paragraph below the hero.", textarea: true },
  { key: "cta_primary", label: "Primary button text", hint: "Example: Read featured essay" },
  { key: "cta_secondary", label: "Secondary button text", hint: "Example: More from the writers" },
  { key: "about_copy", label: "About-page copy", hint: "One or two sentences. Keep it personal, not corporate.", textarea: true },
  { key: "footer_text", label: "Footer text", hint: "Short line at the bottom of every page." },
  { key: "empty_posts_message", label: "Empty archive message", hint: "Shown when a writer has no posts yet." },
];

export default function SiteTextForm({ initial, isAdmin }: { initial: SiteSettingsInput; isAdmin: boolean }) {
  const [values, setValues] = useState<SiteSettingsInput>(initial);
  const [state, setState] = useState<SaveState>("saved");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  useUnsavedWarning(dirty);

  if (!isAdmin) {
    return <p className="lede">Only the admin can edit site-wide text. Members edit their own posts and profile.</p>;
  }

  const save = async () => {
    const errs = validateSiteSettings(values);
    const map: Record<string, string> = {};
    errs.forEach((e) => {
      map[e.field] = e.message;
    });
    setErrors(map);
    if (errs.length > 0) {
      setState("error");
      return;
    }
    setState("saving");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.status === 503) {
        // Demo mode (no Supabase): local preview persists without code changes.
        setLocalSettingsOverride(values);
        setState("saved");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setState("error");
        setErrors({ _form: body.error ?? "Save failed." });
        return;
      }
      setLocalSettingsOverride(values);
      setState("saved");
    } catch {
      setState("error");
    }
  };

  return (
    <form
      className="flex flex-col gap-5"
      aria-label="Site text"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      {FIELDS.map((f) => (
        <div key={f.key} className="flex flex-col gap-1">
          <label className="font-bold" htmlFor={`site-${f.key}`}>
            {f.label}{" "}
            {isPlaceholderCopy(values[f.key]) && (
              <span className="sticker sticker-tape" style={{ fontSize: "0.65rem" }}>
                Placeholder
              </span>
            )}
          </label>
          <span className="meta">{f.hint}</span>
          {f.textarea ? (
            <textarea
              id={`site-${f.key}`}
              value={values[f.key]}
              rows={3}
              onChange={(e) => {
                setValues({ ...values, [f.key]: e.target.value });
                setState("dirty");
              }}
              className="rounded-xl border-2 border-[var(--foreground)] bg-transparent px-4 py-2.5"
            />
          ) : (
            <input
              id={`site-${f.key}`}
              value={values[f.key]}
              onChange={(e) => {
                setValues({ ...values, [f.key]: e.target.value });
                setState("dirty");
              }}
              className="rounded-xl border-2 border-[var(--foreground)] bg-transparent px-4 py-2.5"
            />
          )}
          {errors[f.key] && (
            <span className="text-sm font-bold text-red-800" role="alert">
              {errors[f.key]}
            </span>
          )}
        </div>
      ))}
      {errors._form && (
        <p role="alert" className="font-bold text-red-800">
          {errors._form}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button type="submit" className="btn w-fit">
          Save site text
        </button>
        <SaveStatus state={dirty && state === "saved" ? "dirty" : state} />
      </div>
    </form>
  );
}
