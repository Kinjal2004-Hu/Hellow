import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "./Layout";

export function StubPage({ title, phase }: { title: string; phase: string }) {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-2xl mx-auto mt-20 text-center animate-fade-slide-up">
          <span className="text-[11px] font-semibold tracking-widest text-muted-foreground">
            {phase}
          </span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Route scaffolded. Full module ships in the upcoming phase per the
            architecture plan.
          </p>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
