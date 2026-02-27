"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Check,
  Zap,
  ArrowRight,
  Loader2,
  Phone,
  Users,
  Bot,
  Shield,
  Clock,
  DollarSign,
  Building2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";

interface LocationUsage {
  ghl_location_id: string;
  ghl_location_name: string;
  twilio_phone_number: string | null;
  total_calls: number;
  total_seconds: number;
  total_cost_cents: number;
  calls: CallRow[];
}

interface CallRow {
  id: string;
  contact_phone: string;
  duration_seconds: number;
  cost_cents: number;
  status: string;
  summary: string;
  created_at: string;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [locationUsage, setLocationUsage] = useState<LocationUsage[]>([]);
  const [usageLoading, setUsageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const supabase = createSupabaseBrowserClient();

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true" && !message) {
      setMessage("success");
      window.history.replaceState({}, "", "/billing");
    }
    if (params.get("canceled") === "true" && !message) {
      setMessage("canceled");
      window.history.replaceState({}, "", "/billing");
    }
  }

  const fetchUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [year, month] = selectedMonth.split("-").map(Number);
      const periodStart = new Date(year, month - 1, 1).toISOString();
      const periodEnd = new Date(year, month, 0, 23, 59, 59).toISOString();

      const { data: locations } = await supabase
        .from("ghl_connections")
        .select("ghl_location_id, ghl_location_name, twilio_phone_number, is_activated")
        .eq("agency_id", user.id)
        .eq("is_activated", true)
        .order("ghl_location_name");

      const { data: calls } = await supabase
        .from("call_logs")
        .select("id, ghl_location_id, contact_phone, duration_seconds, cost_cents, status, summary, created_at")
        .eq("agency_id", user.id)
        .gte("created_at", periodStart)
        .lte("created_at", periodEnd)
        .order("created_at", { ascending: false });

      const grouped: LocationUsage[] = (locations || []).map((loc: any) => {
        const locCalls = (calls || []).filter((c: any) => c.ghl_location_id === loc.ghl_location_id);
        return {
          ghl_location_id: loc.ghl_location_id,
          ghl_location_name: loc.ghl_location_name,
          twilio_phone_number: loc.twilio_phone_number,
          total_calls: locCalls.length,
          total_seconds: locCalls.reduce((sum: number, c: any) => sum + (c.duration_seconds || 0), 0),
          total_cost_cents: locCalls.reduce((sum: number, c: any) => sum + (c.cost_cents || 0), 0),
          calls: locCalls,
        };
      });

      grouped.sort((a, b) => b.total_calls - a.total_calls);
      setLocationUsage(grouped);
    } catch (err) {
      console.error("Error fetching usage:", err);
    } finally {
      setUsageLoading(false);
    }
  };

  useEffect(() => { fetchUsage(); }, [selectedMonth]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsage();
    setRefreshing(false);
  };

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || undefined }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(false);
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formatCost = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const totalCalls = locationUsage.reduce((sum, l) => sum + l.total_calls, 0);
  const totalSeconds = locationUsage.reduce((sum, l) => sum + l.total_seconds, 0);
  const totalMinutes = Math.ceil(totalSeconds / 60);
  const totalCostCents = locationUsage.reduce((sum, l) => sum + l.total_cost_cents, 0);

  const monthOptions = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    monthOptions.push({ value: val, label });
  }

  return (
    <div className="p-7">
      {/* Success/Cancel Banners */}
      {message === "success" && (
        <div style={{ padding: "14px 20px", background: "#00b89415", border: "1px solid #00b89430", borderRadius: 12, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, color: "#00b894", fontSize: 14, fontWeight: 600 }}>
          <Check size={18} />
          Subscription activated successfully! Welcome to Sylon AI.
        </div>
      )}
      {message === "canceled" && (
        <div style={{ padding: "14px 20px", background: "#f39c1215", border: "1px solid #f39c1230", borderRadius: 12, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, color: "#f39c12", fontSize: 14, fontWeight: 600 }}>
          Checkout was canceled. You can subscribe anytime.
        </div>
      )}

      <h2 className="text-lg font-bold text-brand-900 mb-1">Billing &amp; Usage</h2>
      <p className="text-[13px] text-gray-400 mb-6">Manage your subscription and track usage across locations.</p>

      {/* Subscription Card */}
      <div className="card" style={{ overflow: "hidden", maxWidth: 520, marginBottom: 24 }}>
        <div style={{ background: "linear-gradient(135deg, #6C5CE7, #a29bfe)", padding: "28px 28px 24px", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Zap size={22} />
            <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>SYLON AI</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Assistant Plan</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>$299</span>
            <span style={{ fontSize: 14, opacity: 0.7 }}>/month</span>
          </div>
        </div>
        <div style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#666", marginBottom: 14 }}>Everything you need:</div>
          {[
            { icon: Phone, text: "Unlimited AI calls" },
            { icon: Users, text: "Unlimited client accounts" },
            { icon: Bot, text: "Custom AI agent prompts" },
            { icon: Shield, text: "Priority support" },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 14, color: "#333" }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: "#6C5CE710", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={13} color="#6C5CE7" />
                </div>
                {feature.text}
              </div>
            );
          })}
          <button onClick={handleSubscribe} disabled={loading}
            style={{ width: "100%", marginTop: 20, padding: "14px 24px", borderRadius: 12, border: "none", background: loading ? "#999" : "#6C5CE7", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(108,92,231,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Redirecting to checkout...</>
            ) : (
              <><CreditCard size={16} /> Subscribe — $299/mo <ArrowRight size={16} /></>
            )}
          </button>
          <p style={{ fontSize: 11, color: "#999", textAlign: "center", marginTop: 12 }}>
            Secure payment via Stripe. Cancel anytime.
          </p>
        </div>
      </div>

      {/* Usage Section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-brand-900">Usage This Month</h3>
        <div className="flex items-center gap-3">
          <select value={selectedMonth} onChange={(e) => { setUsageLoading(true); setSelectedMonth(e.target.value); }}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-brand-400">
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <button onClick={handleRefresh} className="btn-secondary" disabled={refreshing}>
            <RefreshCw size={15} className={cn(refreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="card px-5 py-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Calls</div>
          <div className="text-2xl font-bold text-gray-900">{usageLoading ? "—" : totalCalls}</div>
        </div>
        <div className="card px-5 py-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Minutes</div>
          <div className="text-2xl font-bold text-gray-900">{usageLoading ? "—" : totalMinutes}</div>
        </div>
        <div className="card px-5 py-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">AI Cost</div>
          <div className="text-2xl font-bold text-gray-900">{usageLoading ? "—" : formatCost(totalCostCents)}</div>
        </div>
        <div className="card px-5 py-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Active Locations</div>
          <div className="text-2xl font-bold text-gray-900">{usageLoading ? "—" : locationUsage.length}</div>
        </div>
      </div>

      {/* Per-Location Usage */}
      {usageLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-brand-500" />
        </div>
      ) : locationUsage.length === 0 ? (
        <div className="card p-8 text-center">
          <BarChart3 size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No active locations with usage data this month.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {locationUsage.map((loc) => (
            <div key={loc.ghl_location_id} className="card" style={{ overflow: "hidden" }}>
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedLocation(expandedLocation === loc.ghl_location_id ? null : loc.ghl_location_id)}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ backgroundColor: "#6C5CE715" }}>
                  <Building2 size={18} className="text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{loc.ghl_location_name}</div>
                  {loc.twilio_phone_number && <div className="text-[12px] text-gray-400">{loc.twilio_phone_number}</div>}
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{loc.total_calls}</div>
                    <div className="text-[11px] text-gray-400">calls</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{formatDuration(loc.total_seconds)}</div>
                    <div className="text-[11px] text-gray-400">duration</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{formatCost(loc.total_cost_cents)}</div>
                    <div className="text-[11px] text-gray-400">cost</div>
                  </div>
                  {loc.total_calls > 0 ? (
                    expandedLocation === loc.ghl_location_id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />
                  ) : <div className="w-[18px]" />}
                </div>
              </div>

              {expandedLocation === loc.ghl_location_id && loc.calls.length > 0 && (
                <div style={{ borderTop: "1px solid #f0f0f5" }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: "#fafafe" }}>
                        <th className="table-header pl-5">Time</th>
                        <th className="table-header">Caller</th>
                        <th className="table-header">Duration</th>
                        <th className="table-header">Cost</th>
                        <th className="table-header">Status</th>
                        <th className="table-header pr-5">Summary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loc.calls.map((call) => (
                        <tr key={call.id} className="table-row">
                          <td className="table-cell pl-5 text-[13px] text-gray-600 whitespace-nowrap">
                            {new Date(call.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </td>
                          <td className="table-cell text-[13px] font-medium text-gray-800 font-mono">{call.contact_phone || "Unknown"}</td>
                          <td className="table-cell text-[13px] text-gray-700 font-semibold">{formatDuration(call.duration_seconds)}</td>
                          <td className="table-cell text-[13px] text-gray-700">{formatCost(call.cost_cents)}</td>
                          <td className="table-cell">
                            <span className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              call.status === "completed" ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-100 text-gray-500"
                            )}>
                              <span className={cn("h-1.5 w-1.5 rounded-full", call.status === "completed" ? "bg-emerald-500" : "bg-gray-400")} />
                              {call.status}
                            </span>
                          </td>
                          <td className="table-cell pr-5 text-[12px] text-gray-400 truncate max-w-[250px]">{call.summary || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
