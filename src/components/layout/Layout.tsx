import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { LeftSidebar } from "./Sidebar";
import { RightToolRail } from "./RightToolRail";
import { MainWorkspace } from "./MainWorkspace";
import { RightDrawer } from "./RightDrawer";
import { PanelManager } from "@/components/panels/PanelManager";
import { Toaster } from "@/components/ui/sonner";
import { ToastProvider } from "@/components/ToastProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SocketInit } from "@/components/SocketInit";
import { PresenceOverlay } from "@/components/collab/PresenceOverlay";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: ReactNode }) {
  const leftSidebarCollapsed = useUIStore((s) => s.leftSidebarCollapsed);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <SocketInit />
      <Navbar />
      <div className="flex flex-1 overflow-hidden pt-[96px]">
        <LeftSidebar />
        <div
          className={cn(
            "flex-1 overflow-hidden relative transition-[margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            leftSidebarCollapsed ? "ml-[28px]" : "ml-[280px]",
          )}
        >
          <ErrorBoundary>
            <MainWorkspace>{children}</MainWorkspace>
          </ErrorBoundary>
        </div>
        <RightToolRail />
        <RightDrawer />
      </div>
      <PanelManager />
      <PresenceOverlay />
      <ToastProvider />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        }}
      />
    </div>
  );
}
