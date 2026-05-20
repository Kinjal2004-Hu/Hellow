import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/spotsync")({
  component: () => <StubPage title="SpotSync" phase="PHASE 5" />,
});
