"use client";

import { useState } from "react";
import {
  BarChart3,
  Sparkles,
  Phone,
  Puzzle,
  PhoneCall,
  Calendar,
  Target,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CallLogsTable } from "@/components/calls/call-logs-table";
import { PromptBuilder } from "@/components/prompts/prompt-builder";
import { IntegrationsGrid } from "@/components/integrations/integrations-grid";
import type { ClientAccount, CallLog } from "@/types";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "prompts", label: "Prompt Settings", icon: Sparkles },
  { id: "calls", label: "Call Logs", icon: Phone },
  { id: "integrations", label: "Integrations", icon: Puzzle },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface ClientDetailTabsProps {
  client: ClientAccount;
  callLogs: CallLog[];
}

export function ClientDetailTabs({ client, callLogs }: ClientDetailTabsProps) {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-100 mb-6">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-[13px] border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-brand-500 text-brand-500 font-semibold"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "overview" && <OverviewTab client={client} />}
      {tab === "prompts" && <PromptBuilder />}
      {tab === "calls" && <CallLogsTable logs={callLogs} />}
      {tab === "integrations" && <IntegrationsGrid isClientLevel />}
    </>
  );
}

function OverviewTab({ client }: { client: ClientAccount }) {
  const cards = [
    { label: "Calls Today", value: client.callsToday, icon: PhoneCall },
    { label: "Appointments", value: client.appointmentsToday, icon: Calendar },
    { label: "Conversion", value: client.conversion, icon: Target },
    { label: "Status", value: client.status, icon: Activity },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="card p-5">
            <Icon size={18} className="text-brand-500 mb-2" />
            <div className="text-[22px] font-bold text-brand-900 capitalize">
              {c.value}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{c.label}</div>
          </div>
        );
      })}
    </div>
  );
}
