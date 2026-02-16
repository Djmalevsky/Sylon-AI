import Link from "next/link";
import { UserPlus, Settings } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { CLIENTS } from "@/lib/mock-data";

export default function ClientsPage() {
  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-brand-900">All Clients</h2>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {CLIENTS.length} clients managed
          </p>
        </div>
        <button className="btn-primary">
          <UserPlus size={16} />
          Add Client
        </button>
      </div>

      <div className="card">
        <table className="w-full">
          <thead>
            <tr>
              {[
                "Client Name",
                "Status",
                "Calls Today",
                "Appointments",
                "Conversion",
                "",
              ].map((h) => (
                <th key={h} className="table-header first:pl-5 last:pr-5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CLIENTS.map((client) => (
              <tr key={client.id} className="table-row">
                <td className="table-cell pl-5">
                  <Link
                    href={`/clients/${client.id}`}
                    className="flex items-center gap-2.5 group"
                  >
                    <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-brand-500/10 text-[13px] font-bold text-brand-500">
                      {client.name[0]}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 group-hover:text-brand-500 transition-colors">
                      {client.name}
                    </span>
                  </Link>
                </td>
                <td className="table-cell">
                  <StatusBadge status={client.status} />
                </td>
                <td className="table-cell font-semibold text-gray-800">
                  {client.callsToday}
                </td>
                <td className="table-cell font-semibold text-gray-800">
                  {client.appointmentsToday}
                </td>
                <td className="table-cell font-semibold text-emerald-600">
                  {client.conversion}
                </td>
                <td className="table-cell pr-5">
                  <Link
                    href={`/clients/${client.id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-500 hover:text-brand-500 transition-colors"
                  >
                    <Settings size={13} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
