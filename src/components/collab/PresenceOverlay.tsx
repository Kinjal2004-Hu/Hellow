import { useEffect, useRef } from "react";
import { useWorkspaceStore, type CursorPresence } from "@/store/useWorkspaceStore";

interface PresenceOverlayProps {
  containerRef?: React.RefObject<HTMLElement | null>;
}

function CursorChip({ cursor }: { cursor: CursorPresence }) {
  return (
    <div
      className="absolute pointer-events-none z-50 transition-[left,top] duration-75 ease-linear"
      style={{ left: cursor.x, top: cursor.y }}
    >
      {/* Cursor arrow */}
      <svg width="16" height="16" viewBox="0 0 16 16" className="drop-shadow-sm">
        <path
          d="M2 2 L10 14 L7 9 L14 8 Z"
          fill="#3b82f6"
          stroke="white"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
      {/* Label */}
      <span className="ml-1 px-1.5 py-0.5 rounded-md bg-blue-500 text-white text-[10px] font-medium whitespace-nowrap shadow-sm">
        {cursor.userId.slice(0, 4)}
      </span>
    </div>
  );
}

export function PresenceOverlay({ containerRef }: PresenceOverlayProps) {
  const cursors = useWorkspaceStore((s) => s.cursors);
  const presence = useWorkspaceStore((s) => s.presence);
  const isJoined = useWorkspaceStore((s) => s.isJoined);

  if (!isJoined || cursors.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {cursors.map((cursor) => (
        <CursorChip key={cursor.userId} cursor={cursor} />
      ))}
    </div>
  );
}

interface PresenceIndicatorProps {
  maxVisible?: number;
}

export function PresenceIndicator({ maxVisible = 5 }: PresenceIndicatorProps) {
  const members = useWorkspaceStore((s) => s.members);
  const presence = useWorkspaceStore((s) => s.presence);
  const isJoined = useWorkspaceStore((s) => s.isJoined);

  if (!isJoined || members.length === 0) return null;

  const visible = members.slice(0, maxVisible);
  const overflow = members.length - maxVisible;

  function getStatusColor(userId: string): string {
    const p = presence.find((pr) => pr.userId === userId);
    if (!p || p.status === "active") return "bg-green-500";
    if (p.status === "idle") return "bg-yellow-400";
    return "bg-gray-400";
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-1.5">
        {visible.map((id) => (
          <div
            key={id}
            className="relative h-6 w-6 rounded-full bg-primary/20 border-2 border-background grid place-items-center"
            title={id}
          >
            <span className="text-[9px] font-semibold">{id.slice(0, 2).toUpperCase()}</span>
            <span
              className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border border-background ${getStatusColor(id)}`}
            />
          </div>
        ))}
        {overflow > 0 && (
          <div className="h-6 w-6 rounded-full bg-accent border-2 border-background grid place-items-center">
            <span className="text-[9px] font-medium text-muted-foreground">+{overflow}</span>
          </div>
        )}
      </div>
    </div>
  );
}
