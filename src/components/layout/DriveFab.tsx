import { Link } from "@tanstack/react-router";
import { FolderOpen } from "lucide-react";

export function DriveFab() {
  return (
    <Link
      to="/drive"
      aria-label="Open Drive"
      title="Drive"
      className="fixed bottom-5 right-[4.5rem] z-30 h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-pop hover:scale-105 transition"
    >
      <FolderOpen className="h-5 w-5" />
    </Link>
  );
}
