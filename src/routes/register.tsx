import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { useRegisterMutation } from "@/hooks/useAuthMutations";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: doRegister, isPending } = useRegisterMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doRegister({ username, email, password });
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex w-[55%] bg-gradient-to-br from-[#FFF5D6] via-[#D8F5E0] to-[#FFE8D6] items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground grid place-items-center font-bold text-2xl mx-auto mb-4">
            H
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome to Hellow</h2>
          <p className="mt-2 text-sm text-foreground/65">
            One calm place for everything you do.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-bold tracking-tight mb-1">Create your account</h1>
          <p className="text-[13px] text-muted-foreground mb-6">
            It takes less than a minute.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2.5 h-11 px-3.5 rounded-xl bg-surface border border-border transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:border-foreground/20 focus-within:shadow-soft">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-transparent outline-none flex-1 text-sm placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="flex items-center gap-2.5 h-11 px-3.5 rounded-xl bg-surface border border-border transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:border-foreground/20 focus-within:shadow-soft">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent outline-none flex-1 text-sm placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="flex items-center gap-2.5 h-11 px-3.5 rounded-xl bg-surface border border-border transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:border-foreground/20 focus-within:shadow-soft">
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-transparent outline-none flex-1 text-sm placeholder:text-muted-foreground/60"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Creating..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            Already have one?{" "}
            <Link
              to="/login"
              className="underline underline-offset-2 font-medium text-foreground/80 hover:text-foreground"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
