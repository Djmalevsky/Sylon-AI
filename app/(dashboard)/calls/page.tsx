"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Loader2,
  RefreshCw,
  Search,
  Play,
  Clock,
  ChevronDown,
  ChevronUp,
  Building2,
  FileText,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";

interface CallLog {
  id: string;
  agency_id: string;
  ghl_location_id: string;
  vapi_call_id: string;
  contact_phone: string;
  direction: string;
  status: string;
  duration_seconds: number;
  cost_cents: number;
  transcript: string;
  summary: string;
  recording_url: string;
  sentiment: string | null;
  created_at: string;
  ghl_location_name?: string;
}

export default function CallsPage() {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
  const [filterDirection, setFilterDirection] = useState<"all" | "inbound" | "outbound">("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);

  const supabase = createSupabaseBrowserClient();

  const fetchCalls = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch locations for filter and name lookup
      const { data: locs } = await supabase
        .from("ghl_connections")
        .select("ghl_location_id, ghl_location_name")
        .eq("agency_id", user.id)
        .eq("is_activated", true);

      const locMap: Record<string, string> = {};
      (locs || []).forEach((l: any) => { locMap[l.ghl_location_id] = l.ghl_location_name; });
      setLocations((locs || []).map((l: any) => ({ id: l.ghl_location_id, name: l.ghl_location_name })));

      const { data, error } = await supabase
        .from("call_logs")
        .select("*")
        .eq("agency_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      const enriched = (data || []).map((c: any) => ({
        ...c,
        ghl_location_name: locMap[c.ghl_location_id] || "Unknown Location",
      }));

      setCalls(enriched);
    } catch (err) {
      console.error("Error fetching calls:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCalls(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCalls();
    setRefreshing(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formatCost = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const filtered = calls.filter((c) => {
    if (filterDirection !== "all" && c.direction !== filterDirection) return false;
    if (filterLocation !== "all" && c.ghl_location_id !== filterLocation) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.contact_phone?.includes(q) ||
        c.ghl_location_name?.toLowerCase().includes(q) ||
        c.summary?.toLowerCase().includes(q) ||
        c.transcript?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalMinutes = Math.ceil(calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / 60);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-brand-500" />
          <span className="text-sm text-gray-400">Loading call logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-brand-900">Call Logs &amp; Transcripts</h2>
          <p className="text-[13px] text-gray-400 mt-0.5">{calls.length} calls &middot; {totalMinutes} total minutes</p>
        </div>
        <button onClick={handleRefresh} className="btn-secondary" disabled={refreshing}>
          <RefreshCw size={15} className={cn(refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input type="text" placeholder="Search calls, transcripts, summaries..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
          />
        </div>
        <select value={filterDirection} onChange={(e) => setFilterDirection(e.target.value as any)}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-brand-400">
          <option value="all">All Directions</option>
          <option value="inbound">Inbound</option>
          <option value="outbound">Outbound</option>
        </select>
        {locations.length > 1 && (
          <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-brand-400 max-w-[200px]">
            <option value="all">All Locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Call List */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: "#6C5CE715" }}>
              <Phone size={28} className="text-brand-500" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {calls.length === 0 ? "No Calls Yet" : "No Matching Calls"}
          </h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            {calls.length === 0
              ? "Activate a location and make a call to see logs here."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((call) => (
            <div key={call.id} className="card" style={{ overflow: "hidden" }}>
              {/* Call Row */}
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedCall(expandedCall === call.id ? null : call.id)}>
                {/* Direction Icon */}
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
                  call.direction === "inbound" ? "bg-blue-50" : "bg-emerald-50"
                )}>
                  {call.direction === "inbound"
                    ? <PhoneIncoming size={18} className="text-blue-500" />
                    : <PhoneOutgoing size={18} className="text-emerald-500" />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 font-mono">{call.contact_phone || "Unknown"}</span>
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      call.status === "completed" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                    )}>
                      <span className={cn("h-1 w-1 rounded-full", call.status === "completed" ? "bg-emerald-500" : "bg-amber-500")} />
                      {call.status}
                    </span>
                  </div>
                  <div className="text-[12px] text-gray-400 mt-0.5 truncate">
                    {call.ghl_location_name} &middot; {call.summary ? call.summary.slice(0, 80) + (call.summary.length > 80 ? "..." : "") : "No summary"}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-5 shrink-0">
                  <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                    <Clock size={14} className="text-gray-400" />
                    {formatDuration(call.duration_seconds)}
                  </div>
                  <div className="text-[13px] font-medium text-gray-700">{formatCost(call.cost_cents)}</div>
                  <div className="text-[12px] text-gray-400 whitespace-nowrap">
                    {new Date(call.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </div>
                  {(call.transcript || call.recording_url) ? (
                    expandedCall === call.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />
                  ) : <div className="w-[18px]" />}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCall === call.id && (
                <div style={{ borderTop: "1px solid #f0f0f5" }} className="px-5 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left: Transcript */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={14} className="text-brand-500" />
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Transcript</span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 max-h-[300px] overflow-y-auto">
                        {call.transcript ? (
                          <pre className="text-[13px] text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                            {call.transcript}
                          </pre>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No transcript available</p>
                        )}
                      </div>
                    </div>

                    {/* Right: Summary + Recording + Details */}
                    <div className="space-y-4">
                      {call.summary && (
                        <div>
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Summary</div>
                          <p className="text-[13px] text-gray-700 leading-relaxed">{call.summary}</p>
                        </div>
                      )}

                      {call.recording_url && (
                        <div>
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Recording</div>
                          <audio controls className="w-full" style={{ height: 36 }}>
                            <source src={call.recording_url} type="audio/wav" />
                          </audio>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                          <div className="text-[10px] text-gray-400 uppercase">Direction</div>
                          <div className="text-[13px] font-semibold text-gray-800 capitalize">{call.direction}</div>
                        </div>
                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                          <div className="text-[10px] text-gray-400 uppercase">Location</div>
                          <div className="text-[13px] font-semibold text-gray-800 truncate">{call.ghl_location_name}</div>
                        </div>
                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                          <div className="text-[10px] text-gray-400 uppercase">Duration</div>
                          <div className="text-[13px] font-semibold text-gray-800">{formatDuration(call.duration_seconds)}</div>
                        </div>
                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                          <div className="text-[10px] text-gray-400 uppercase">Cost</div>
                          <div className="text-[13px] font-semibold text-gray-800">{formatCost(call.cost_cents)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
