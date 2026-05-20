import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <div className="w-full max-w-md rounded-3xl bg-surface border border-border shadow-card p-8">
        <h1 className="text-xl font-semibold tracking-tight mb-1">Create your account</h1>
        <p className="text-sm text-muted-foreground mb-6">It takes less than a minute.</p>

        <button
          disabled
          className="w-full h-11 rounded-xl border border-border bg-background hover:bg-accent text-sm font-medium transition disabled:opacity-60"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-3">
          <input placeholder="Username" className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/30" />
          <input type="email" placeholder="you@example.com" className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/30" />
          <input type="password" placeholder="Password" className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/30" />
          <button type="button" className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            Create account
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-muted-foreground">
          Already have one?{" "}
          <Link to="/login" className="underline underline-offset-2">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
