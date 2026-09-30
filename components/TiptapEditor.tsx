"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";

/** Minimal Tiptap surface — JSON stays in state for save/preview; sanitize on render. */
export default function TiptapEditor() {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    content:
      "<h2>TODO essay draft</h2><p>Scene-led opening goes here. Select text for bold, italic, headings, lists, and blockquotes.</p><blockquote>TODO pull quote placeholder.</blockquote>",
    onUpdate: () => setSavedAt(null),
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Formatting">
        {(
          [
            ["H2", () => editor?.chain().focus().toggleHeading({ level: 2 }).run()],
            ["Bold", () => editor?.chain().focus().toggleBold().run()],
            ["Italic", () => editor?.chain().focus().toggleItalic().run()],
            ["Quote", () => editor?.chain().focus().toggleBlockquote().run()],
            ["• List", () => editor?.chain().focus().toggleBulletList().run()],
            ["1. List", () => editor?.chain().focus().toggleOrderedList().run()],
          ] as Array<[string, () => void]>
        ).map(([label, fn]) => (
          <button key={label} type="button" className="btn btn-secondary" onClick={fn}>
            {label}
          </button>
        ))}
        <button
          type="button"
          className="btn"
          onClick={() => {
            const json = editor?.getJSON();
            try {
              localStorage.setItem("bandits-draft", JSON.stringify(json));
            } catch {
              /* private mode — ignore */
            }
            setSavedAt(new Date().toLocaleTimeString());
          }}
        >
          Save draft
        </button>
      </div>
      <div className="min-h-48 rounded-xl border-2 border-[var(--foreground)] p-4 prose-measure">
        <EditorContent editor={editor} aria-label="Essay body editor" />
      </div>
      <p className="meta" role="status">
        {savedAt ? `Draft saved locally at ${savedAt} (Supabase sync when configured).` : "Unsaved changes stay local until Supabase is configured."}
      </p>
    </div>
  );
}
