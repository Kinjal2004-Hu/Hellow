import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/meetings")({
  component: () => <StubPage title="Meetings" phase="PHASE 5" />,
});
