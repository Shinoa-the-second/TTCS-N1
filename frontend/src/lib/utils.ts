import clsx, { ClassValue } from "clsx";

/** Tailwind className merger giống cn() trong shadcn. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format ISO datetime → "DD/MM/YYYY HH:mm" */
export function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "Cao" / "Trung bình" / "Thấp" → màu Tailwind. */
export function riskLevelColors(level: string) {
  switch (level) {
    case "Cao":
      return {
        bg: "bg-rose-50",
        border: "border-rose-200",
        text: "text-rose-700",
        bar: "bg-rose-500",
        chip: "bg-rose-600",
      };
    case "Trung bình":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        bar: "bg-amber-500",
        chip: "bg-amber-600",
      };
    default:
      return {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        bar: "bg-emerald-500",
        chip: "bg-emerald-600",
      };
  }
}

/** Derive risk level từ probability (fallback nếu AI không trả). */
export function deriveRiskLevel(probability: number): "Cao" | "Trung bình" | "Thấp" {
  if (probability >= 0.8) return "Cao";
  if (probability >= 0.5) return "Trung bình";
  return "Thấp";
}
