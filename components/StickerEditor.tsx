"use client";

import { useState } from "react";
import {
  MAX_STICKERS_PER_POST,
  STARTER_STICKERS,
  clampNorm,
  type StickerPlacement,
} from "@/lib/stickers";

/**
 * Accessible sticker placement controls: pointer drag on the canvas plus
 * keyboard nudge buttons + position presets + undo/reset. Positions are
 * stored normalized so published views render consistently.
 */
export default function StickerEditor() {
  const [placements, setPlacements] = useState<StickerPlacement[]>([]);
  const [history, setHistory] = useState<StickerPlacement[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const push = (next: StickerPlacement[]) => {
    setHistory((h) => [...h.slice(-19), placements]);
    setPlacements(next);
  };

  const add = (stickerId: string) => {
    if (placements.length >= MAX_STICKERS_PER_POST) {
      alert(`Density guard: max ${MAX_STICKERS_PER_POST} stickers per post.`);
      return;
    }
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    // eslint-disable-next-line react-hooks/purity
    const jx = Math.random();
    // eslint-disable-next-line react-hooks/purity
    const jy = Math.random();
    // eslint-disable-next-line react-hooks/purity
    const jr = Math.random();
    const p: StickerPlacement = {
      id: `${stickerId}-${now}`,
      stickerId,
      x: 0.15 + jx * 0.6,
      y: 0.1 + jy * 0.5,
      w: 0.22,
      rotation: -6 + jr * 12,
      anchor: "margin",
      alt: "",
      decorative: true,
    };
    push([...placements, p]);
    setSelectedId(p.id);
  };

  const patch = (id: string, d: Partial<StickerPlacement>) =>
    push(placements.map((p) => (p.id === id ? { ...p, ...d } : p)));

  const remove = (id: string) => {
    push(placements.filter((p) => p.id !== id));
    setSelectedId(null);
  };

  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setPlacements(prev);
    setHistory((h) => h.slice(0, -1));
  };

  const selected = placements.find((p) => p.id === selectedId);
  const overDensity = placements.length >= MAX_STICKERS_PER_POST;

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <div>
        <p className="meta">Starter library (placeholders)</p>
        <ul className="mt-2 flex flex-wrap gap-2 lg:flex-col">
          {STARTER_STICKERS.map((s) => (
            <li key={s.id}>
              <button type="button" className={`sticker sticker-${s.kind}`} onClick={() => add(s.id)}>
                {s.glyph}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={undo} disabled={history.length === 0}>
            Undo
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => push([])} disabled={placements.length === 0}>
            Reset
          </button>
        </div>
        {overDensity && <p className="meta mt-2" role="alert">Density limit reached — remove one to add more.</p>}
      </div>

      <div className="flex flex-col gap-4">
        <div
          className="relative min-h-72 overflow-hidden rounded-xl border-2 p-4"
          aria-label="Sticker canvas preview. Select a sticker, then use keyboard controls."
        >
          <p className="meta">Canvas preview · positions scale responsively</p>
          <div className="prose-measure mt-2">
            <p className="leading-[1.75]">
              TODO paragraph placeholder — stickers live in margins or on photos, never over
              this text. Shrink the window: placements reposition via % anchoring.
            </p>
          </div>
          {placements.map((p) => {
            const def = STARTER_STICKERS.find((s) => s.id === p.stickerId)!;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                aria-pressed={selectedId === p.id}
                aria-label={`${def.label}${p.decorative ? " (decorative)" : `: ${p.alt || "needs alt text"}`}`}
                className={`sticker sticker-${def.kind} absolute ${selectedId === p.id ? "outline-4" : ""}`}
                style={{
                  left: `${p.x * 100}%`,
                  top: `${p.y * 100}%`,
                  width: `${p.w * 100}%`,
                  ["--sticker-rotate" as string]: `${p.rotation}deg`,
                  maxWidth: "180px",
                }}
              >
                {def.glyph}
              </button>
            );
          })}
        </div>

        {selected ? (
          <fieldset className="hero">
            <legend className="meta">Selected sticker controls (keyboard accessible)</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["←", { x: clampNorm(selected.x - 0.05) }],
                  ["→", { x: clampNorm(selected.x + 0.05) }],
                  ["↑", { y: clampNorm(selected.y - 0.05) }],
                  ["↓", { y: clampNorm(selected.y + 0.05) }],
                  ["− size", { w: clampNorm(Math.max(0.08, selected.w - 0.05)) }],
                  ["+ size", { w: clampNorm(Math.min(0.6, selected.w + 0.05)) }],
                  ["⟲", { rotation: selected.rotation - 15 }],
                  ["⟳", { rotation: selected.rotation + 15 }],
                ] as Array<[string, Partial<StickerPlacement>]>
              ).map(([label, d]) => (
                <button
                  key={label}
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => patch(selected.id, d)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["inline", "margin", "photo"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`btn ${selected.anchor === a ? "" : "btn-secondary"}`}
                  aria-pressed={selected.anchor === a}
                  onClick={() => patch(selected.id, { anchor: a })}
                >
                  {a}
                </button>
              ))}
            </div>
            <label className="meta mt-3" htmlFor="sticker-alt">
              Alt text (or mark decorative)
            </label>
            <input
              id="sticker-alt"
              value={selected.alt}
              onChange={(e) => patch(selected.id, { alt: e.target.value })}
              placeholder="Describe meaning, or leave empty if decorative"
              className="rounded-lg border px-3 py-1.5 text-sm"
            />
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.decorative}
                onChange={(e) => patch(selected.id, { decorative: e.target.checked })}
              />
              Decorative (hidden from screen readers)
            </label>
            <button type="button" className="btn btn-secondary mt-3 w-fit" onClick={() => remove(selected.id)}>
              Delete sticker
            </button>
          </fieldset>
        ) : (
          <p className="meta">Select a sticker on the canvas for keyboard move / resize / rotate.</p>
        )}
      </div>
    </div>
  );
}
