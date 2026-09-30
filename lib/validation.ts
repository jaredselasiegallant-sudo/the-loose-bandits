/** Shared validators — used in UI *and* server routes. DB/RLS is the final guard. */

export const isHexColor = (v: string): boolean => /^#[0-9a-fA-F]{6}$/.test(v.trim());

export const isSlug = (v: string): boolean => /^[a-z0-9-]{1,80}$/.test(v.trim());

export const isSafeUrl = (v: string): boolean => {
  const t = v.trim();
  if (t === "") return true; // optional fields
  try {
    const u = new URL(t, "https://placeholder.local");
    return u.protocol === "http:" || u.protocol === "https:" || t.startsWith("/");
  } catch {
    return false;
  }
};

export interface FieldError {
  field: string;
  message: string;
}

export interface SiteSettingsInput {
  site_title: string;
  wordmark_text: string;
  home_intro: string;
  hero_headline: string;
  hero_deck: string;
  cta_primary: string;
  cta_secondary: string;
  about_copy: string;
  footer_text: string;
  empty_posts_message: string;
}

export function validateSiteSettings(v: SiteSettingsInput): FieldError[] {
  const errs: FieldError[] = [];
  const req: Array<keyof SiteSettingsInput> = [
    "site_title",
    "hero_headline",
    "hero_deck",
    "about_copy",
  ];
  for (const k of req) {
    if (!v[k] || v[k].trim().length === 0) errs.push({ field: k, message: "Required." });
    if (v[k] && v[k].length > 2000) errs.push({ field: k, message: "Too long (max 2000 chars)." });
  }
  return errs;
}

export interface MemberInput {
  display_name: string;
  bio: string;
  primary_color: string;
  soft_color: string;
  ink_color: string;
  on_primary_color: string;
  avatar_url: string;
  mark: string;
}

export function validateMember(v: MemberInput): FieldError[] {
  const errs: FieldError[] = [];
  if (!v.display_name.trim()) errs.push({ field: "display_name", message: "Name is required." });
  if (v.display_name.length > 80) errs.push({ field: "display_name", message: "Max 80 chars." });
  if (v.bio.length > 600) errs.push({ field: "bio", message: "Max 600 chars." });
  for (const k of ["primary_color", "soft_color", "ink_color", "on_primary_color"] as const) {
    if (!isHexColor(v[k])) errs.push({ field: k, message: "Use #RRGGBB hex." });
  }
  if (!isSafeUrl(v.avatar_url)) errs.push({ field: "avatar_url", message: "Use http(s) URL or /path." });
  if (v.mark.length > 4) errs.push({ field: "mark", message: "Max 4 chars." });
  return errs;
}

export interface PostInput {
  title: string;
  deck: string;
  excerpt: string;
  format: string;
  status: string;
  slug: string;
  seo_title: string;
  seo_description: string;
}

const FORMATS = ["essay", "field-note", "family-lore", "four-takes", "photo-evidence"];
const STATUSES = ["draft", "published", "scheduled"];

export function validatePost(v: PostInput): FieldError[] {
  const errs: FieldError[] = [];
  if (!v.title.trim()) errs.push({ field: "title", message: "Title is required." });
  if (v.title.length > 160) errs.push({ field: "title", message: "Max 160 chars." });
  if (!isSlug(v.slug)) errs.push({ field: "slug", message: "Lowercase letters, numbers, dashes." });
  if (!FORMATS.includes(v.format)) errs.push({ field: "format", message: "Unknown format." });
  if (!STATUSES.includes(v.status)) errs.push({ field: "status", message: "Unknown status." });
  if (v.seo_title.length > 160) errs.push({ field: "seo_title", message: "Max 160 chars." });
  if (v.seo_description.length > 320) errs.push({ field: "seo_description", message: "Max 320 chars." });
  return errs;
}

/** Very small HTML sanitizer for preview fallback — real sanitization runs server-side. */
export function stripScripts(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son\w+="[^"]*"/gi, "");
}
