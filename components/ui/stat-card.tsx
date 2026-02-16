import { ArrowUpRight } from "lucide-react";
import type { StatCardData } from "@/types";

interface StatCardProps {
  stat: StatCardData;
}

export function StatCard({ stat }: StatCardProps) {
  const Icon = stat.icon;
  return (
    <div className="card p-5 flex items-center gap-4 flex-1 min-w-0">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${stat.color}15` }}
      >
        <Icon size={20} style={{ color: stat.color }} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-brand-900 leading-tight">
          {stat.value}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
        <div className="text-[11px] text-emerald-500 mt-1 flex items-center gap-1">
          <ArrowUpRight size={12} />
          {stat.change}
        </div>
      </div>
    </div>
  );
}
