import { useEffect, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  text: string;
  align?: "left" | "right";
}

/**
 * Tooltip hiện khi hover hoặc click (cho mobile).
 * Click ngoài → đóng. Click button → toggle pin.
 */
export function Tooltip({ text, align = "right" }: TooltipProps) {
  const [show, setShow] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!show) return;
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [show]);

  return (
    <span ref={wrapRef} className="relative inline-flex group">
      <button
        type="button"
        aria-label="Xem chú thích"
        onClick={(e) => {
          e.stopPropagation();
          setShow((s) => !s);
        }}
        className={cn(
          "p-0.5 transition-colors",
          show ? "text-blue-600" : "text-slate-400 hover:text-blue-600"
        )}
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      <span
        className={cn(
          "absolute bottom-full mb-2 w-60 p-2.5",
          "bg-slate-800 text-white text-xs leading-relaxed rounded-lg",
          "shadow-lg z-30 pointer-events-none transition-all duration-150",
          align === "right" ? "right-0" : "left-0",
          show
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0"
        )}
      >
        {text}
        <span
          className={cn(
            "absolute top-full -mt-px border-[5px] border-transparent border-t-slate-800",
            align === "right" ? "right-2" : "left-2"
          )}
        />
      </span>
    </span>
  );
}
