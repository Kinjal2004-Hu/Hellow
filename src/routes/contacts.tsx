import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/contacts")({
  component: () => <StubPage title="Contacts" phase="PHASE 4" />,
});
