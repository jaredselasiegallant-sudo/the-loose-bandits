export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_BYTES = 8 * 1024 * 1024; // 8MB — tune per plan
export const MAX_PER_POST = 12;

export interface ImageValidation {
  ok: boolean;
  error?: string;
}

export function validateImageFile(file: { type: string; size: number; name: string }): ImageValidation {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { ok: false, error: `Unsupported type ${file.type || file.name}. Use JPG, PNG, WebP, or AVIF.` };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `File too large (${(file.size / 1048576).toFixed(1)}MB). Max 8MB.` };
  }
  return { ok: true };
}

/** Normalized placement helpers keep published stickers consistent across sizes. */
export const clampNorm = (n: number): number => Math.min(1, Math.max(0, n));
