import Link from "next/link";
import SignOutButton from "./SignOutButton";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Signed-in state: current user + role + way back to public site.
 * Renders nothing editor-like for signed-out/public visitors.
 */
export default async function AuthHeader() {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return (
      <Link href="/login" className="nav-link">
        Sign in
      </Link>
    );
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <Link href="/login" className="nav-link">
        Sign in
      </Link>
    );
  }
  const { data: member } = await supabase
    .from("members")
    .select("display_name,role")
    .eq("auth_id", user.id)
    .single();
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="meta" role="status">
        {member?.display_name ?? user.email} · {member?.role ?? "member"}
      </span>
      <Link href="/dashboard" className="nav-link">
        Dashboard
      </Link>
      <SignOutButton />
    </span>
  );
}
