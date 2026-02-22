import { Link2 } from "lucide-react";

interface IntegrationsGridProps {
  isClientLevel?: boolean;
}

export function IntegrationsGrid({ isClientLevel = false }: IntegrationsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card p-7 text-center">
        <div
          className="mx-auto mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px]"
          style={{ backgroundColor: "#00b89415" }}
        >
          <Link2 size={22} color="#00b894" />
        </div>
        <h4 className="text-[15px] font-bold text-brand-900 mb-1">
          GoHighLevel
        </h4>
        <p className="text-xs text-gray-400 mb-3.5">CRM & Automation</p>
        <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Connected
        </div>
        <button className="mt-3.5 block mx-auto btn-secondary text-xs py-2 px-5">
          Manage Connection
        </button>
      </div>
    </div>
  );
}
