import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";
import { DriveFab } from "./DriveFab";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Sidebar />
      <RightPanel />
      <main className="pt-16 pl-[280px] pr-14 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
      <DriveFab />
    </div>
  );
}
