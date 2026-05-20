import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/layout/Layout";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <Layout>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Micro-learning card */}
        <section className="xl:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-widest text-muted-foreground">
              MICRO-LEARNING
            </span>
            <span className="text-xs text-muted-foreground">1 / 5</span>
          </div>

          <article className="rounded-3xl bg-surface border border-border shadow-card overflow-hidden">
            <div className="aspect-[16/7] bg-gradient-to-br from-muted to-accent grid place-items-center">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Book of the moment
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span className="px-2 py-0.5 rounded-full bg-muted">Productivity</span>
                <span>·</span>
                <span>Cal Newport</span>
                <span>·</span>
                <span>3 min read</span>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                The Power of Deep Work
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Deep work is the ability to focus without distraction on a cognitively
                demanding task. It's a skill that lets you master complicated information
                and produce better results in less time.
              </p>
              <div className="mt-5 flex items-center justify-between">
                <button className="inline-flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-foreground">
                  Next idea <ChevronRight className="h-4 w-4" />
                </button>
                <span className="text-xs text-muted-foreground">Short reads, big ideas</span>
              </div>
            </div>
          </article>
        </section>

        {/* News column */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-widest text-muted-foreground">
              LATEST
            </span>
            <span className="text-xs text-muted-foreground">News for you</span>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <article
                key={i}
                className="rounded-2xl bg-surface border border-border p-3 shadow-soft hover:shadow-card transition"
              >
                <div className="aspect-[16/9] rounded-xl bg-muted mb-3" />
                <div className="text-[11px] text-muted-foreground mb-1">
                  Source · today
                </div>
                <h3 className="text-sm font-medium leading-snug">
                  News card placeholder — wired to Smart News in Phase 6
                </h3>
              </article>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
