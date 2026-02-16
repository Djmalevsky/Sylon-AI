import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/ui/status-badge";
import { ClientDetailTabs } from "@/components/clients/client-detail-tabs";
import { getClientById, getCallLogsByClientId, CALL_LOGS } from "@/lib/mock-data";

interface ClientDetailPageProps {
  params: { id: string };
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const client = getClientById(params.id);

  if (!client) {
    notFound();
  }

  const callLogs = getCallLogsByClientId(client.id);
  // If no client-specific logs, show all logs as fallback for demo
  const logsToShow = callLogs.length > 0 ? callLogs : CALL_LOGS;

  return (
    <div className="p-7">
      {/* Back link */}
      <Link
        href="/clients"
        className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-500 hover:text-brand-600 mb-4 transition-colors"
      >
        <ChevronLeft size={16} />
        Back to Clients
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 text-xl font-bold text-white">
          {client.name[0]}
        </div>
        <div>
          <h2 className="text-xl font-bold text-brand-900">{client.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={client.status} />
            <span className="text-xs text-gray-400">
              {client.callsToday} calls today
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ClientDetailTabs client={client} callLogs={logsToShow} />
    </div>
  );
}
