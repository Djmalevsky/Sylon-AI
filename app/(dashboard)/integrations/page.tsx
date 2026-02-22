"use client";

import { useState } from "react";
import { Link2, Check, Eye, EyeOff, Trash2, ExternalLink } from "lucide-react";

export default function IntegrationsPage() {
  const [token, setToken] = useState("");
  const [locationId, setLocationId] = useState("");
  const [locationName, setLocationName] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!token.trim()) { setError("Please enter your Private Integration token"); return; }
    if (!locationId.trim()) { setError("Please enter your GHL Location ID"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/ghl/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), locationId: locationId.trim(), locationName: locationName.trim() || "My Agency" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save"); setSaving(false); return; }
      setSaved(true);
      setSaving(false);
    } catch (err) { setError("Failed to save. Please try again."); setSaving(false); }
  }

  return (
    <div className="p-7">
      <h2 className="text-lg font-bold text-brand-900 mb-1">Integrations</h2>
      <p className="text-[13px] text-gray-400 mb-6">Connect your GoHighLevel account to start automating calls.</p>
      <div className="card max-w-[560px]" style={{ overflow: "hidden" }}>
        <div className="flex items-center gap-4 p-6" style={{ borderBottom: "1px solid #f0f0f5" }}>
          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[12px]" style={{ backgroundColor: "#00b89415" }}>
            <Link2 size={22} color="#00b894" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-brand-900">GoHighLevel</h3>
            <p className="text-xs text-gray-400">CRM &amp; Automation</p>
          </div>
          {saved && (
            <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Connected
            </div>
          )}
        </div>
        <div className="p-6">
          {saved ? (
            <div>
              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: "#00b89408", border: "1px solid #00b89420" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Check size={16} color="#00b894" />
                  <span className="text-sm font-semibold" style={{ color: "#00b894" }}>Successfully connected</span>
                </div>
                <p className="text-xs text-gray-500">Location: {locationName || "My Agency"} ({locationId})</p>
                <p className="text-xs text-gray-400 mt-1">Token: {token.slice(0, 8)}...{token.slice(-4)}</p>
              </div>
              <button onClick={() => { setSaved(false); setToken(""); setLocationId(""); }} className="flex items-center gap-2 text-xs text-red-400 hover:text-red-500">
                <Trash2 size={13} /> Disconnect
              </button>
            </div>
          ) : (
            <div>
              <p className="text-[13px] text-gray-500 mb-4">Connect your GHL account using a Private Integration token.</p>
              <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: "#f8f8fc", border: "1px solid #f0f0f5" }}>
                <p className="text-xs font-semibold text-gray-600 mb-2">How to get your token:</p>
                <ol className="text-xs text-gray-500 space-y-1.5" style={{ paddingLeft: 16 }}>
                  <li>Go to GHL Settings Integrations Private Integrations</li>
                  <li>Click Create New and name it Sylon AI</li>
                  <li>Enable permissions: Contacts, Calendars, Opportunities</li>
                  <li>Copy the API token and paste it below</li>
                </ol>
                <a href="https://app.gohighlevel.com/settings/integrations" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold mt-3" style={{ color: "#6C5CE7" }}>
                  Open GHL Settings <ExternalLink size={11} />
                </a>
              </div>
              {error && <div className="rounded-lg px-4 py-2.5 mb-4 text-xs font-semibold" style={{ backgroundColor: "#e74c3c10", color: "#e74c3c", border: "1px solid #e74c3c20" }}>{error}</div>}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Agency / Location Name</label>
                <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="e.g. Bright Smile Dental" className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: "#e8e8ef" }} />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">GHL Location ID</label>
                <input type="text" value={locationId} onChange={(e) => setLocationId(e.target.value)} placeholder="e.g. abc123DEFghiJKL" className="w-full rounded-lg border px-3.5 py-2.5 text-sm font-mono outline-none" style={{ borderColor: "#e8e8ef" }} />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Private Integration Token</label>
                <div className="relative">
                  <input type={showToken ? "text" : "password"} value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste your GHL token" className="w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm font-mono outline-none" style={{ borderColor: "#e8e8ef" }} />
                  <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full rounded-xl py-3 text-sm font-bold text-white" style={{ backgroundColor: saving ? "#999" : "#6C5CE7", cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(108,92,231,0.25)" }}>
                {saving ? "Connecting..." : "Connect GoHighLevel"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
