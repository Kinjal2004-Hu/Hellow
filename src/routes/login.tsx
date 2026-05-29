import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  MessageSquare,
  StickyNote,
  CheckSquare,
  Newspaper,
  Bell,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";
import { useLoginMutation } from "@/hooks/useAuthMutations";
import { getGoogleOAuthUrl } from "@/services/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const FEATURES = [
  { icon: MessageSquare, label: "Chat" },
  { icon: StickyNote, label: "Notes" },
  { icon: CheckSquare, label: "Todos" },
  { icon: Newspaper, label: "News" },
  { icon: Bell, label: "Reminders" },
  { icon: Sparkles, label: "AI" },
];

const btn =
  "transition duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: doLogin, isPending } = useLoginMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin({ email, password });
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-[55%] bg-gradient-to-br from-[#FFF5D6] via-[#D8F5E0] to-[#FFE8D6] flex-col justify-center px-16 py-12 relative overflow-hidden">
        <div className="relative z-10 max-w-lg animate-fade-slide-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm text-[11px] font-semibold text-foreground/70 mb-7 shadow-soft">
            <Sparkles className="h-3 w-3" />
            YOUR PRODUCTIVITY HOME
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">
            One calm place
            <br />
            for everything
            <br />
            you do.
          </h1>
          <p className="mt-5 text-sm text-foreground/65 leading-relaxed max-w-md">
            Chat rooms, notes, reminders, news, and an AI assistant — woven
            into a single, focused dashboard.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {FEATURES.map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/55 text-xs font-medium text-foreground/80 transition duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/80 hover:scale-105"
              >
                <f.icon className="h-3 w-3" />
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#FAFAF8] px-6 py-12">
        <div className="w-full max-w-sm animate-fade-slide-up">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold text-lg">
              H
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight">Hellow</div>
              <div className="text-[13px] text-muted-foreground">
                Sign in to continue
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2.5 h-11 px-3.5 rounded-xl bg-background border border-border transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:border-foreground/20 focus-within:shadow-soft">
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
            <div className="flex items-center gap-2.5 h-11 px-3.5 rounded-xl bg-background border border-border transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:border-foreground/20 focus-within:shadow-soft">
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
              className={`w-full h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium ${btn} hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2`}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span className="font-medium">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <a
            href={getGoogleOAuthUrl()}
            className={`w-full h-11 rounded-full border border-border bg-white text-sm font-medium text-foreground/90 ${btn} hover:bg-accent inline-flex items-center justify-center gap-2.5`}
          >
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            New here?{" "}
            <Link
              to="/register"
              className="underline underline-offset-2 font-medium text-foreground/80 transition duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-foreground"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
