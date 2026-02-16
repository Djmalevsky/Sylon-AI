import { Plus, Bot } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { AGENTS } from "@/lib/mock-data";

export default function AgentsPage() {
  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-brand-900">AI Agents</h2>
        <button className="btn-primary">
          <Plus size={16} />
          Create Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AGENTS.map((agent) => (
          <div key={agent.id} className="card p-7 text-center">
            <div className="mx-auto mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-gradient-to-br from-brand-500/10 to-brand-400/10">
              <Bot size={24} className="text-brand-500" />
            </div>
            <h4 className="text-[15px] font-bold text-brand-900 mb-1">
              {agent.name}
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Active on {agent.clientCount} clients
            </p>
            <StatusBadge status={agent.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
