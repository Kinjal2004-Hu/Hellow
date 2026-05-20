import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/news")({
  component: () => <StubPage title="Smart News" phase="PHASE 6" />,
});
