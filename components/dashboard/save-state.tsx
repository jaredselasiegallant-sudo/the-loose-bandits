"use client";

import { useEffect } from "react";

/** Warn before leaving a form with unsaved changes. */
export function useUnsavedWarning(dirty: boolean): void {
  useEffect(() => {
    if (!dirty) return;
    const onBefore = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBefore);
    return () => window.removeEventListener("beforeunload", onBefore);
  }, [dirty]);
}

export type SaveState = "saved" | "saving" | "dirty" | "error";

export function SaveStatus({ state, message }: { state: SaveState; message?: string }) {
  const label =
    state === "saved" ? "Saved" : state === "saving" ? "Saving…" : state === "error" ? "Error saving" : "Unsaved changes";
  return (
    <p className="meta" role="status" aria-live="polite">
      {label}
      {message ? ` — ${message}` : ""}
    </p>
  );
}
