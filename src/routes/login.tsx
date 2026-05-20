import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <div className="w-full max-w-md rounded-3xl bg-surface border border-border shadow-card p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold">
            H
          </div>
          <div>
            <div className="font-semibold text-lg leading-none">Hellow</div>
            <div className="text-xs text-muted-foreground mt-1">
              One calm place for everything you do.
            </div>
          </div>
        </div>

        <h1 className="text-xl font-semibold tracking-tight mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to continue to your dashboard.
        </p>

        <button
          disabled
          className="w-full h-11 rounded-xl border border-border bg-background hover:bg-accent text-sm font-medium transition disabled:opacity-60"
          title="Wires up in Phase 3"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-3">
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/30"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/30"
          />
          <button
            type="button"
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-muted-foreground">
          New here?{" "}
          <Link to="/register" className="underline underline-offset-2">
            Create an account
          </Link>
        </p>
        <p className="mt-4 text-[11px] text-center text-muted-foreground">
          Auth wires up in Phase 3 (real Google OAuth + email/password).
        </p>
      </div>
    </div>
  );
}
