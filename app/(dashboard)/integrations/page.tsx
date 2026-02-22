"use client";

import { useState } from "react";
import { Link2, Check, Eye, EyeOff, Trash2, ExternalLink, Building2, Loader2, ToggleLeft, ToggleRight } from "lucide-react";

interface GHLLocation {
  id: string;
  name: string;
  city?: string;
  state?: string;
  enabled: boolean;
}

export default function IntegrationsPage() {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [locations, setLocations] = useState<GHLLocation[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleConnect() {
    if (!token.trim()) { setError("Please enter your Agency Private Integration token"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ghl/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to connect. Check your token."); setLoading(false); return; }
      setLocations(data.locations.map((loc: any) => ({ ...loc, enabled: true })));
      setConnected(true);
      setLoading(false);
    } catch (err) { setError("Failed to connect. Please try again."); setLoading(false); }
  }

  function toggleLocation(id: string) {
    setLocations(locations.map((loc) => loc.id === id ? { ...loc, enabled: !loc.enabled } : loc));
  }

  async function handleSaveLocations() {
    setSaving(true);
    try {
      const res = await fetch("/api/ghl/save-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), locations: locations.filter((loc) => loc.enabled) }),
      });
      if (!res.ok) { const data = await res.json(); setError(data.error || "Failed to save"); }
      setSaving(false);
    } catch (err) { setError("Failed to save."); setSaving(false); }
  }

  function handleDisconnect() { setToken(""); setConnected(false); setLocations([]); setError(""); }

  const enabledCount = locations.filter((l) => l.enabled).length;

  return (
    <div className="p-7">
      <h2 className="text-lg font-bold text-brand-900 mb-1">Integrations</h2>
      <p className="text-[13px] text-gray-400 mb-6">Connect your GoHighLevel account to start automating calls across all your locations.</p>

      <div className="card max-w-[640px]" style={{ overflow: "hidden" }}>
        <div className="flex items-center gap-4 p-6" style={{ borderBottom: "1px solid #f0f0f5" }}>
          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[12px]" style={{ backgroundColor: "#00b89415" }}>
            <Link2 size={22} color="#00b894" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-brand-900">GoHighLevel</h3>
            <p className="text-xs text-gray-400">CRM &amp; Automation</p>
          </div>
          {connected && (
            <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Connected &middot; {enabledCount} location{enabledCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div className="p-6">
          {connected ? (
            <div>
              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: "#00b89408", border: "1px solid #00b89420" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Check size={16} color="#00b894" />
                  <span className="text-sm font-semibold" style={{ color: "#00b894" }}>Agency connected successfully</span>
                </div>
                <p className="text-xs text-gray-400">Token: {token.slice(0, 12)}...{token.slice(-4)}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">Sub-Accounts ({locations.length})</p>
                  <p className="text-xs text-gray-400">{enabledCount} of {locations.length} active</p>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {locations.map((loc) => (
                    <div key={loc.id} className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all"
                      style={{ backgroundColor: loc.enabled ? "#f8f8fc" : "#fafafa", border: loc.enabled ? "1px solid #6C5CE720" : "1px solid #f0f0f0", opacity: loc.enabled ? 1 : 0.6 }}
                      onClick={() => toggleLocation(loc.id)}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: loc.enabled ? "#6C5CE715" : "#f0f0f0" }}>
                        <Building2 size={16} color={loc.enabled ? "#6C5CE7" : "#999"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{loc.name}</p>
                        {(loc.city || loc.state) && <p className="text-xs text-gray-400 truncate">{[loc.city, loc.state].filter(Boolean).join(", ")}</p>}
                      </div>
                      <div className="shrink-0">
                        {loc.enabled ? <ToggleRight size={24} color="#6C5CE7" /> : <ToggleLeft size={24} color="#ccc" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleSaveLocations} disabled={saving || enabledCount === 0}
                  className="flex-1 rounded-xl py-3 text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: saving || enabledCount === 0 ? "#999" : "#6C5CE7", cursor: saving || enabledCount === 0 ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(108,92,231,0.25)" }}>
                  {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <>Save ({enabledCount} location{enabledCount !== 1 ? "s" : ""})</>}
                </button>
                <button onClick={handleDisconnect} className="rounded-xl px-5 py-3 text-sm font-semibold text-red-400 border" style={{ borderColor: "#fee2e2" }}>
                  <Trash2 size={14} />
                </button>
              </div>

              {error && <div className="rounded-lg px-4 py-2.5 mt-4 text-xs font-semibold" style={{ backgroundColor: "#e74c3c10", color: "#e74c3c", border: "1px solid #e74c3c20" }}>{error}</div>}
            </div>
          ) : (
            <div>
              <p className="text-[13px] text-gray-500 mb-4">Connect your GHL agency with one token. Sylon will automatically detect all your sub-accounts.</p>

              <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: "#f8f8fc", border: "1px solid #f0f0f5" }}>
                <p className="text-xs font-semibold text-gray-600 mb-2">How to connect:</p>
                <ol className="text-xs text-gray-500 space-y-1.5" style={{ paddingLeft: 16 }}>
                  <li>1. Go to GHL Agency Settings &rarr; Private Integrations</li>
                  <li>2. Click &quot;Create New&quot; and name it &quot;Sylon AI&quot;</li>
                  <li>3. Select scopes: Locations, Contacts, Calendars, Opportunities</li>
                  <li>4. Copy the token and paste it below</li>
                </ol>
                <a href="https://app.gohighlevel.com/settings/integrations" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold mt-3" style={{ color: "#6C5CE7" }}>
                  Open GHL Agency Settings <ExternalLink size={11} />
                </a>
              </div>

              {error && <div className="rounded-lg px-4 py-2.5 mb-4 text-xs font-semibold" style={{ backgroundColor: "#e74c3c10", color: "#e74c3c", border: "1px solid #e74c3c20" }}>{error}</div>}

              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Agency Private Integration Token</label>
                <div className="relative">
                  <input type={showToken ? "text" : "password"} value={token} onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your agency-level Private Integration token"
                    className="w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm font-mono outline-none" style={{ borderColor: "#e8e8ef" }} />
                  <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button onClick={handleConnect} disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: loading ? "#999" : "#6C5CE7", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(108,92,231,0.25)" }}>
                {loading ? <><Loader2 size={15} className="animate-spin" /> Connecting &amp; fetching locations...</> : "Connect GoHighLevel"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
