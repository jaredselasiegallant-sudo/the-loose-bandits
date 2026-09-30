"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <button
      type="button"
      className="nav-link"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const supabase = createClient();
          await supabase?.auth.signOut();
        } finally {
          setBusy(false);
          router.push("/");
          router.refresh();
        }
      }}
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
