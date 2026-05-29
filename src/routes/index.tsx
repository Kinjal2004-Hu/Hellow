import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardHome } from "@/components/layout/DashboardHome";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export const Route = createFileRoute("/")({
  component: DashboardRoute,
  pendingComponent: DashboardSkeleton,
});

function DashboardRoute() {
  return (
    <ProtectedRoute>
      <Layout>
        <DashboardHome />
      </Layout>
    </ProtectedRoute>
  );
}
