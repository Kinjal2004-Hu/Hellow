import { useEffect } from "react";
import { toast } from "sonner";
import { useUIStore } from "@/store/useUIStore";

export function ToastProvider() {
  const toastState = useUIStore((s) => s.toast);

  useEffect(() => {
    if (!toastState) return;
    switch (toastState.type) {
      case "error":
        toast.error(toastState.message, { id: toastState.id });
        break;
      case "success":
        toast.success(toastState.message, { id: toastState.id });
        break;
      default:
        toast(toastState.message, { id: toastState.id });
    }
  }, [toastState]);

  return null;
}
