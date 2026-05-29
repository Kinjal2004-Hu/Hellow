import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMountTransition } from "@/hooks/useMountTransition";

interface HellowModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
  showClose?: boolean;
}

export function HellowModal({
  open,
  onClose,
  title,
  children,
  className,
  maxWidth = "max-w-[700px]",
  showClose = true,
}: HellowModalProps) {
  const { mounted, animatingIn } = useMountTransition(open, 200);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted) return null;

  const exiting = open && !animatingIn;
  const entering = open && animatingIn;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm",
          entering && "animate-backdrop-in",
          exiting && "animate-backdrop-out",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-[70] w-full bg-[#FAFAF8] rounded-2xl shadow-pop mx-4 pt-12 pb-6 px-6",
          entering && "animate-modal-enter",
          exiting && "animate-modal-exit",
          maxWidth,
          className,
        )}
      >
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-full text-foreground/60 hover:bg-accent hover:text-foreground transition duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {title && (
          <h2 className="text-lg font-semibold tracking-tight mb-5 pr-8">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
