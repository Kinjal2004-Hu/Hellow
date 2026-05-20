import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/profile")({
  component: () => <StubPage title="Profile" phase="PHASE 6" />,
});
