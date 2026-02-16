import { cn } from "@/lib/utils";
import type { StatusType } from "@/types";

const statusStyles: Record<string, string> = {
  Booked: "bg-brand-500/10 text-brand-500 border-brand-500/20",
  "No Answer": "bg-red-500/10 text-red-500 border-red-500/20",
  Callback: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  paused: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  onboarding: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "no-answer": "bg-red-500/10 text-red-500 border-red-500/20",
  voicemail: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  connected: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  disconnected: "bg-red-500/10 text-red-500 border-red-500/20",
  managed: "bg-brand-500/10 text-brand-500 border-brand-500/20",
};

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-3 py-1 rounded-full text-xs font-semibold border capitalize",
        statusStyles[status] ?? "bg-gray-100 text-gray-500 border-gray-200",
        className
      )}
    >
      {status}
    </span>
  );
}
