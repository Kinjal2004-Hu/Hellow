import { Link } from "@tanstack/react-router";
import { FolderOpen } from "lucide-react";

export function DriveFab() {
  return (
    <Link
      to="/drive"
      aria-label="Open Drive"
      title="Drive"
      className="fixed bottom-6 right-[5.5rem] z-30 h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-pop transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.25)] active:scale-95 cursor-pointer"
    >
      <FolderOpen className="h-5 w-5" />
    </Link>
  );
}
