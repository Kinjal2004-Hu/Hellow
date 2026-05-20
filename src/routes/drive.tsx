import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/drive")({
  component: () => <StubPage title="Drive" phase="PHASE 6" />,
});
