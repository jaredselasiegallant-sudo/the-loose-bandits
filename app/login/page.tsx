import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 flex flex-col gap-6">
      <p className="meta">Private · writers only</p>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Sign in</h1>
      <LoginForm />
    </main>
  );
}
