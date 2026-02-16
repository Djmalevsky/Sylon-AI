"use client";

import { Filter, CheckCircle, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CallLog } from "@/types";

interface CallLogsTableProps {
  logs: CallLog[];
  showFilter?: boolean;
}

export function CallLogsTable({ logs, showFilter = true }: CallLogsTableProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-brand-900">Call Logs</h3>
        {showFilter && (
          <button className="btn-secondary text-xs py-1.5 px-3">
            <Filter size={13} />
            Filter
          </button>
        )}
      </div>

      <table className="w-full">
        <thead>
          <tr>
            {["Contact", "Phone", "Status", "Duration", "Booked?", "Time", ""].map(
              (h) => (
                <th key={h} className="table-header">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="table-row">
              <td className="table-cell font-medium text-gray-800">
                {log.contactName}
              </td>
              <td className="table-cell text-gray-500">{log.contactPhone}</td>
              <td className="table-cell">
                <StatusBadge status={log.status} />
              </td>
              <td className="table-cell text-gray-500">{log.duration}</td>
              <td className="table-cell">
                {log.appointmentBooked ? (
                  <CheckCircle size={16} className="text-emerald-500" />
                ) : (
                  <XCircle size={16} className="text-gray-300" />
                )}
              </td>
              <td className="table-cell text-gray-500">{log.createdAt}</td>
              <td className="table-cell">
                <button className="rounded-md border border-brand-500/20 bg-brand-500/5 px-3 py-1 text-[11px] font-semibold text-brand-500 hover:bg-brand-500/10 transition-colors">
                  Transcript
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
