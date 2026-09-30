type StickerKind = "stamp" | "tape" | "star" | "note";

const KIND_LABEL: Record<StickerKind, string> = {
  stamp: "Evidence stamp placeholder",
  tape: "Tape label placeholder",
  star: "Star mark placeholder",
  note: "Handwritten note placeholder",
};

/**
 * Decorative-by-default sticker punctuation. Set decorative={false} + label
 * when the sticker carries meaning.
 */
export default function Sticker({
  kind = "stamp",
  children,
  rotate = -4,
  decorative = true,
  label,
}: {
  kind?: StickerKind;
  children?: React.ReactNode;
  rotate?: number;
  decorative?: boolean;
  label?: string;
}) {
  const a11y = decorative
    ? { "aria-hidden": true as const }
    : { role: "img" as const, "aria-label": label ?? KIND_LABEL[kind] };
  return (
    <span className={`sticker sticker-${kind}`} style={{ ["--sticker-rotate" as string]: `${rotate}deg` }} {...a11y}>
      {children ?? (kind === "star" ? "★" : kind === "tape" ? "placeholder" : "BANDITS")}
    </span>
  );
}
