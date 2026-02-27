"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  Search,
  Zap,
  CheckCircle2,
  Loader2,
  Building2,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ActivationModal } from "@/components/clients/activation-modal";
import { DeactivateModal } from "@/components/clients/deactivate-modal";
import { cn } from "@/lib/utils";

interface ClientLocation {
  id: string;
  agency_id: string;
  ghl_location_id: string;
  ghl_location_name: string;
  is_activated: boolean;
  activated_at: string | null;
  twilio_phone_number: string | null;
  twilio_phone_sid: string | null;
  vapi_assistant_id: string | null;
  vapi_phone_number_id: string | null;
  created_at: string;
}

export default function ClientsPage() {
  const [locations, setLocations] = useState<ClientLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activateTarget, setActivateTarget] = useState<ClientLocation | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<ClientLocation | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const supabase = createSupabaseBrowserClient();

  const fetchLocations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("ghl_connections")
        .select("*")
        .eq("agency_id", user.id)
        .order("ghl_location_name", { ascending: true });

      if (error) throw error;
      setLocations(data || []);
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLocations();
    setRefreshing(false);
  };

  const filtered = locations.filter((loc) =>
    loc.ghl_location_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = locations.filter((l) => l.is_activated).length;
  const totalCount = locations.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-brand-500" />
          <span className="text-sm text-gray-400">Loading locations...</span>
        </div>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="p-7">
        <div className="card p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
              <Building2 size={28} className="text-brand-500" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Locations Found</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
            Connect your GoHighLevel account first to see your sub-accounts here.
            Go to Integrations to add your Private Integration token.
          </p>
          <a href="/integrations" className="btn-primary">
            <Zap size={16} />
            Connect GHL
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-7">
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-brand-900">Client Locations</h2>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {activeCount} of {totalCount} locations activated
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn-secondary"
          disabled={refreshing}
        >
          <RefreshCw size={15} className={cn(refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="card px-5 py-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Total Locations
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
        </div>
        <div className="card px-5 py-4">
          <div className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider mb-1">
            Active
          </div>
          <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
        </div>
        <div className="card px-5 py-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Inactive
          </div>
          <div className="text-2xl font-bold text-gray-400">
            {totalCount - activeCount}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
        />
        <input
          type="text"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
        />
      </div>

      {/* Locations Grid */}
      <div className="grid gap-3">
        {filtered.map((loc) => (
          <div
            key={loc.id}
            className={cn(
              "card px-5 py-4 flex items-center gap-4 transition-all",
              loc.is_activated
                ? "border-emerald-200 bg-emerald-50/30"
                : "hover:border-gray-200"
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                loc.is_activated
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-gray-100 text-gray-400"
              )}
            >
              {loc.is_activated ? (
                <CheckCircle2 size={20} />
              ) : (
                <Building2 size={20} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {loc.ghl_location_name}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[12px] text-gray-400 font-mono truncate">
                  {loc.ghl_location_id}
                </span>
              </div>
            </div>

            {/* Status / Phone */}
            {loc.is_activated ? (
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                    <Phone size={13} />
                    {loc.twilio_phone_number}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Active since{" "}
                    {loc.activated_at
                      ? new Date(loc.activated_at).toLocaleDateString()
                      : "—"}
                  </div>
                </div>
                <button
                  onClick={() => setDeactivateTarget(loc)}
                  className="inline-flex h-9 items-center gap-1.5 px-3 rounded-lg border border-red-200 text-red-500 text-[13px] font-medium hover:bg-red-50 transition-colors"
                >
                  <PhoneOff size={13} />
                  Deactivate
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActivateTarget(loc)}
                className="shrink-0 inline-flex h-9 items-center gap-1.5 px-4 rounded-lg bg-brand-500 text-white text-[13px] font-semibold shadow-[0_2px_8px_rgba(108,92,231,0.25)] hover:bg-brand-600 transition-colors"
              >
                <Zap size={14} />
                Activate AI Calling
              </button>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && searchQuery && (
        <div className="card p-8 text-center">
          <p className="text-sm text-gray-400">
            No locations matching &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {/* Modals */}
      {activateTarget && (
        <ActivationModal
          location={activateTarget}
          onClose={() => setActivateTarget(null)}
          onSuccess={() => {
            setActivateTarget(null);
            fetchLocations();
          }}
        />
      )}

      {deactivateTarget && (
        <DeactivateModal
          location={deactivateTarget}
          onClose={() => setDeactivateTarget(null)}
          onSuccess={() => {
            setDeactivateTarget(null);
            fetchLocations();
          }}
        />
      )}
    </div>
  );
}
