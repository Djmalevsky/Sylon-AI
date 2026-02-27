"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  Building2,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";

interface PhoneNumberRow {
  id: string;
  ghl_location_id: string;
  ghl_location_name: string;
  twilio_phone_number: string | null;
  twilio_phone_sid: string | null;
  vapi_assistant_id: string | null;
  vapi_phone_number_id: string | null;
  is_activated: boolean;
  activated_at: string | null;
}

export default function PhoneNumbersPage() {
  const [numbers, setNumbers] = useState<PhoneNumberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const supabase = createSupabaseBrowserClient();

  const fetchNumbers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("ghl_connections")
        .select("id, ghl_location_id, ghl_location_name, twilio_phone_number, twilio_phone_sid, vapi_assistant_id, vapi_phone_number_id, is_activated, activated_at")
        .eq("agency_id", user.id)
        .eq("is_activated", true)
        .order("activated_at", { ascending: false });

      if (error) throw error;
      setNumbers(data || []);
    } catch (err) {
      console.error("Error fetching numbers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNumbers(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNumbers();
    setRefreshing(false);
  };

  const filtered = numbers.filter((n) =>
    n.ghl_location_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.twilio_phone_number?.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-brand-500" />
          <span className="text-sm text-gray-400">Loading phone numbers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-brand-900">Phone Numbers</h2>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {numbers.length} active number{numbers.length !== 1 ? "s" : ""} across your locations
          </p>
        </div>
        <button onClick={handleRefresh} className="btn-secondary" disabled={refreshing}>
          <RefreshCw size={15} className={cn(refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="card px-5 py-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Active Numbers</div>
          <div className="text-2xl font-bold text-brand-500">{numbers.length}</div>
        </div>
        <div className="card px-5 py-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Monthly Cost</div>
          <div className="text-2xl font-bold text-gray-900">${(numbers.length * 1.5).toFixed(2)}</div>
        </div>
        <div className="card px-5 py-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">VAPI Assistants</div>
          <div className="text-2xl font-bold text-emerald-600">{numbers.filter((n) => n.vapi_assistant_id).length}</div>
        </div>
      </div>

      {numbers.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: "#6C5CE715" }}>
              <Phone size={28} className="text-brand-500" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Phone Numbers Yet</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
            Activate AI Calling on a client location to purchase a phone number. Go to Clients to get started.
          </p>
          <a href="/clients" className="btn-primary">
            <Building2 size={16} />
            Go to Clients
          </a>
        </div>
      ) : (
        <>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
            <input type="text" placeholder="Search by name or number..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
            />
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header pl-5">Phone Number</th>
                  <th className="table-header">Connected Account</th>
                  <th className="table-header">VAPI Assistant</th>
                  <th className="table-header">Status</th>
                  <th className="table-header pr-5">Activated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="table-row">
                    <td className="table-cell pl-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: "#6C5CE715" }}>
                          <Phone size={16} className="text-brand-500" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{row.twilio_phone_number || "—"}</div>
                          <div className="text-[11px] text-gray-400 font-mono">
                            {row.twilio_phone_sid ? "SID: " + row.twilio_phone_sid.slice(0, 16) + "..." : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-[11px] font-bold text-gray-500">
                          {row.ghl_location_name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800 truncate max-w-[200px]">{row.ghl_location_name}</div>
                          <div className="text-[11px] text-gray-400 font-mono truncate max-w-[200px]">{row.ghl_location_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {row.vapi_assistant_id ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          <span className="text-[12px] text-gray-500 font-mono truncate max-w-[120px]">{row.vapi_assistant_id.slice(0, 12)}...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <XCircle size={14} className="text-gray-300" />
                          <span className="text-[12px] text-gray-400">Not linked</span>
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                    <td className="table-cell pr-5 text-sm text-gray-500">
                      {row.activated_at ? new Date(row.activated_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && searchQuery && (
            <div className="card p-8 text-center mt-3">
              <p className="text-sm text-gray-400">No numbers matching &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
