import { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store";
import { removeToast, ToastType } from "@/store/toastSlice";
import { cn } from "@/lib/utils";

const COLORS: Record<ToastType, string> = {
  success: "bg-emerald-600",
  error: "bg-rose-600",
  warning: "bg-amber-500",
  info: "bg-slate-700",
};

const ICONS: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function ToastContainer() {
  const items = useAppSelector((s) => s.toast.items);
  const dispatch = useAppDispatch();

  // Tự động xóa sau 3.5s
  useEffect(() => {
    if (items.length === 0) return;
    const timers = items.map((t) =>
      setTimeout(() => dispatch(removeToast(t.id)), 3500)
    );
    return () => timers.forEach(clearTimeout);
  }, [items, dispatch]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {items.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              "rounded-lg shadow-lg px-4 py-3 flex items-center gap-2",
              "min-w-[260px] max-w-md text-white text-sm",
              "pointer-events-auto animate-in slide-in-from-right",
              COLORS[t.type]
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
