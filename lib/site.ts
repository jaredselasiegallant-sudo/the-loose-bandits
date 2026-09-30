import type { SiteSettingsInput } from "./validation";

export const DEFAULT_SETTINGS: SiteSettingsInput = {
  site_title: "The Loose Bandits",
  wordmark_text: "The Loose Bandits",
  home_intro: "TODO home introduction — founder to supply.",
  hero_headline: "TODO: hero headline — founder to supply",
  hero_deck: "TODO hero deck — one-sentence summary placeholder.",
  cta_primary: "Read featured essay",
  cta_secondary: "More from the writers",
  about_copy: "TODO about copy — founder to supply in one or two sentences.",
  footer_text: "TODO footer text.",
  empty_posts_message: "TODO: no published posts yet.",
};

const LS_KEY = "bandits-settings-override";

export function getLocalSettingsOverride(): Partial<SiteSettingsInput> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Partial<SiteSettingsInput>) : null;
  } catch {
    return null;
  }
}

export function setLocalSettingsOverride(v: SiteSettingsInput): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(v));
  } catch {
    /* private mode — ignore */
  }
}

/** Placeholder badge helper: true while the value is still a seeded TODO. */
export const isPlaceholderCopy = (v: string): boolean => /TODO/i.test(v);
