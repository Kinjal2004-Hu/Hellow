import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/music")({
  component: () => <StubPage title="Group Music Sync" phase="PHASE 5" />,
});
