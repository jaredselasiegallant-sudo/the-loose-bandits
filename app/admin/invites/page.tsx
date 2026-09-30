import Link from "next/link";
import InviteForm from "@/components/InviteForm";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function InvitesPage() {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10 flex flex-col gap-6">
        <p className="meta">Admin · invites · demo mode</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Invite members</h1>
        <InviteForm />
        <Link href="/dashboard" className="btn btn-secondary w-fit">← Dashboard</Link>
      </main>
    );
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10">
        <Link href="/login" className="btn">Sign in</Link>
      </main>
    );
  }
  const { data: me } = await supabase.from("members").select("role").eq("auth_id", user.id).single();
  if (me?.role !== "admin") {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="meta" role="alert">Admin only. Members cannot invite accounts.</p>
        <Link href="/dashboard" className="btn btn-secondary mt-4">← Dashboard</Link>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 flex flex-col gap-6">
      <p className="meta">Admin · invites (no public sign-up)</p>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Invite members</h1>
      <InviteForm />
      <Link href="/dashboard" className="btn btn-secondary w-fit">← Dashboard</Link>
    </main>
  );
}
