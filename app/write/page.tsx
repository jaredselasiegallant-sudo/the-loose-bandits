import ImageUploader from "@/components/ImageUploader";
import StickerEditor from "@/components/StickerEditor";
import TiptapEditor from "@/components/TiptapEditor";

export default function WritePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 flex flex-col gap-10">
      <div className="prose-measure">
        <p className="meta">Write · private (owner-only via RLS when Supabase is connected)</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">New post</h1>
      </div>

      <section aria-labelledby="body-h" className="flex flex-col gap-3">
        <h2 id="body-h" className="font-display text-2xl font-bold">
          1 · Body
        </h2>
        <TiptapEditor />
      </section>

      <section aria-labelledby="photos-h" className="flex flex-col gap-3">
        <h2 id="photos-h" className="font-display text-2xl font-bold">
          2 · Photos
        </h2>
        <ImageUploader />
      </section>

      <section aria-labelledby="stickers-h" className="flex flex-col gap-3">
        <h2 id="stickers-h" className="font-display text-2xl font-bold">
          3 · Stickers
        </h2>
        <StickerEditor />
      </section>
    </main>
  );
}
