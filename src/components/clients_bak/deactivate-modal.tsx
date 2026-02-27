"use client";

import { useState } from "react";
import {
  X,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  PhoneOff,
} from "lucide-react";

interface DeactivateModalProps {
  location: {
    ghl_location_id: string;
    ghl_location_name: string;
    twilio_phone_number: string | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function DeactivateModal({
  location,
  onClose,
  onSuccess,
}: DeactivateModalProps) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [steps, setSteps] = useState<any[]>([]);

  const handleDeactivate = async () => {
    setConfirming(true);
    setError("");

    try {
      const res = await fetch("/api/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ghlLocationId: location.ghl_location_id,
        }),
      });

      const data = await res.json();

      if (data.steps) setSteps(data.steps);

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Deactivation failed");
      }

      setDone(true);
    } catch (err: any) {
      setError(err.message || "Deactivation failed");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-500">
              <PhoneOff size={20} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900">
                Deactivate AI Calling
              </h3>
              <p className="text-[12px] text-gray-400 mt-0.5">
                {location.ghl_location_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {!done && !confirming && steps.length === 0 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertTriangle
                  size={18}
                  className="text-amber-500 shrink-0 mt-0.5"
                />
                <div className="text-[13px] text-amber-700 leading-relaxed">
                  This will release the phone number{" "}
                  <span className="font-semibold">
                    {location.twilio_phone_number}
                  </span>
                  , delete the AI assistant, and stop all calls to this
                  location. This action cannot be undone.
                </div>
              </div>
            </div>
          )}

          {confirming && (
            <div className="flex flex-col items-center py-6 gap-3">
              <Loader2 size={28} className="animate-spin text-red-400" />
              <span className="text-sm text-gray-400">Deactivating...</span>
            </div>
          )}

          {steps.length > 0 && (
            <div className="space-y-2 mb-4">
              {steps.map((s: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg"
                >
                  {s.status === "success" ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <XCircle size={16} className="text-red-500" />
                  )}
                  <span className="text-[13px] text-gray-700 capitalize">
                    {s.step.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          )}

          {done && (
            <div className="text-center py-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Location Deactivated
              </h4>
              <p className="text-[13px] text-gray-400">
                Phone number released. You can re-activate anytime.
              </p>
            </div>
          )}

          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-600 mt-3">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          {!done ? (
            <>
              <button
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={confirming}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {confirming ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <PhoneOff size={15} />
                )}
                Deactivate
              </button>
            </>
          ) : (
            <>
              <div />
              <button
                onClick={onSuccess}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold hover:bg-gray-900 transition-colors"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
