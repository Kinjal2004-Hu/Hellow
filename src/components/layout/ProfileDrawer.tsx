import { User, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLogoutMutation } from "@/hooks/useAuthMutations";

export function ProfileDrawer() {
  const user = useAuthStore((s) => s.user);
  const { mutate: doLogout } = useLogoutMutation();

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center gap-4 px-1">
        <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shrink-0">
          {user?.username?.charAt(0).toUpperCase() ?? "U"}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-[15px] truncate">
            {user?.username ?? "User"}
          </h3>
          <p className="text-[12px] text-muted-foreground truncate">
            {user?.email ?? ""}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <button className="w-full flex items-center gap-3 px-3 h-10 rounded-xl hover:bg-accent/60 transition-all text-[13px] text-foreground/80">
          <Settings className="h-4 w-4 text-muted-foreground" />
          Settings
        </button>
        <button
          onClick={() => doLogout()}
          className="w-full flex items-center gap-3 px-3 h-10 rounded-xl hover:bg-destructive/10 transition-all text-[13px] text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
