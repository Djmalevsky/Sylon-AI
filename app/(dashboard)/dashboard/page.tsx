import { StatCard } from "@/components/ui/stat-card";
import { MiniLineChart } from "@/components/ui/mini-line-chart";
import { MiniCalendar } from "@/components/ui/mini-calendar";
import {
  QuickActions,
  RecentConversations,
  BestAgents,
} from "@/components/dashboard/dashboard-widgets";
import { STATS, CONVERSATIONS, CHART_DATA, AGENT_LEADERBOARD } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="p-7 flex flex-col gap-6">
      {/* Stat cards */}
      <div className="flex gap-4">
        {STATS.map((s, i) => (
          <StatCard key={i} stat={s} />
        ))}
      </div>

      {/* Quick actions */}
      <QuickActions />

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
        {/* Left */}
        <div className="flex flex-col gap-5">
          <RecentConversations data={CONVERSATIONS} />
          <div className="card p-6">
            <h3 className="text-base font-bold text-brand-900 mb-4">
              Upcoming Appointments
            </h3>
            <MiniCalendar />
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-5">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-brand-900">
                Conversations Over Time
              </h3>
              <select className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-500 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <MiniLineChart data={CHART_DATA} width={330} height={200} />
          </div>

          <BestAgents data={AGENT_LEADERBOARD} />
        </div>
      </div>
    </div>
  );
}
