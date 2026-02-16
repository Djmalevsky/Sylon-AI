"use client";

import { Phone, Bot, Eye, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ConversationRow, AgentLeaderboard } from "@/types";

// ─── Quick Action Buttons ───
const QUICK_ACTIONS = [
  { icon: Phone, label: "Add Phone Number" },
  { icon: Bot, label: "Create Agent" },
  { icon: Eye, label: "View Logs" },
];

export function QuickActions() {
  return (
    <div className="flex gap-3">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <button key={action.label} className="btn-secondary">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10">
              <Icon size={14} className="text-brand-500" />
            </div>
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Recent Conversations Table ───
interface RecentConversationsProps {
  data: ConversationRow[];
}

export function RecentConversations({ data }: RecentConversationsProps) {
  return (
    <div className="card p-6">
      <h3 className="text-base font-bold text-brand-900 mb-4">
        Recent Conversations
      </h3>

      <table className="w-full">
        <thead>
          <tr>
            {["Time", "Caller Name", "Channel", "Outcome"].map((h) => (
              <th key={h} className="table-header">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="table-row">
              <td className="table-cell text-gray-500">{row.time}</td>
              <td className="table-cell font-medium text-gray-800">
                {row.callerName}
              </td>
              <td className="table-cell text-gray-500">{row.channel}</td>
              <td className="table-cell">
                <StatusBadge status={row.outcome} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex gap-1">
          {[1, 2, 3, "...", 23, 24].map((p, i) => (
            <button
              key={i}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold ${
                p === 1
                  ? "bg-brand-500 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">
          Showing 7 of 305 elements
        </span>
      </div>
    </div>
  );
}

// ─── Best Agents List ───
interface BestAgentsProps {
  data: AgentLeaderboard[];
}

export function BestAgents({ data }: BestAgentsProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-base font-bold text-brand-900">Best Agents</h3>
        <button className="rounded-full bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 transition-colors">
          See All
        </button>
      </div>

      {data.map((agent, i) => (
        <div
          key={i}
          className={`flex items-center py-2.5 ${
            i < data.length - 1 ? "border-b border-gray-50" : ""
          }`}
        >
          <div
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-xs font-semibold text-white mr-2.5"
            style={{
              background: `hsl(${260 + i * 20}, 60%, ${60 + i * 4}%)`,
            }}
          >
            {agent.name[0]}
          </div>
          <span className="flex-1 text-[13px] font-medium text-gray-700">
            {agent.name}
          </span>
          <span className="text-[13px] text-gray-500 mr-2">
            {agent.calls} Calls
          </span>
          <ArrowRight
            size={14}
            className="text-brand-500 cursor-pointer hover:translate-x-0.5 transition-transform"
          />
        </div>
      ))}
    </div>
  );
}
