export interface StickerDef {
  id: string;
  kind: "stamp" | "tape" | "star" | "note";
  label: string;
  glyph: string;
}

/** Generic starter library — neutral placeholders, no member-specific art. */
export const STARTER_STICKERS: StickerDef[] = [
  { id: "stamp-bandits", kind: "stamp", label: "Evidence stamp", glyph: "BANDITS" },
  { id: "stamp-todo", kind: "stamp", label: "TODO stamp", glyph: "TODO" },
  { id: "tape-label", kind: "tape", label: "Tape label", glyph: "field note" },
  { id: "star-one", kind: "star", label: "Star", glyph: "★" },
  { id: "note-margin", kind: "note", label: "Margin note", glyph: "look closer →" },
  { id: "arrow-note", kind: "note", label: "Arrow note", glyph: "↗ same moment" },
];

export interface StickerPlacement {
  id: string;
  stickerId: string;
  /** normalized 0..1 so rendering is consistent across screen sizes */
  x: number;
  y: number;
  w: number;
  rotation: number;
  anchor: "inline" | "margin" | "photo";
  alt: string;
  decorative: boolean;
}

export const MAX_STICKERS_PER_POST = 8;

export const clampNorm = (n: number): number => Math.min(1, Math.max(0, n));
