"use client";

import { useState } from "react";
import {
  X,
  Search,
  Phone,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Zap,
  MapPin,
  Building2,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivationModalProps {
  location: {
    id: string;
    agency_id: string;
    ghl_location_id: string;
    ghl_location_name: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

interface AvailableNumber {
  phoneNumber: string;
  friendlyName: string;
  locality: string;
  region: string;
}

interface ActivationStep {
  step: string;
  status: "success" | "failed";
  error?: string;
}

const BUSINESS_TYPES = [
  { value: "dental", label: "Dental", icon: "🦷" },
  { value: "chiropractic", label: "Chiropractic", icon: "🦴" },
  { value: "medspa", label: "Med Spa", icon: "✨" },
  { value: "physical-therapy", label: "Physical Therapy", icon: "💪" },
  { value: "optometry", label: "Optometry", icon: "👁" },
  { value: "dermatology", label: "Dermatology", icon: "🧴" },
  { value: "veterinary", label: "Veterinary", icon: "🐾" },
  { value: "general-healthcare", label: "General Healthcare", icon: "🏥" },
  { value: "other", label: "Other", icon: "🏢" },
];

export function ActivationModal({
  location,
  onClose,
  onSuccess,
}: ActivationModalProps) {
  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Business info
  const [businessName, setBusinessName] = useState(location.ghl_location_name);
  const [businessType, setBusinessType] = useState("");

  // Step 2: Phone number search
  const [areaCode, setAreaCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [searchError, setSearchError] = useState("");

  // Step 3: Number selection
  const [selectedNumber, setSelectedNumber] = useState<AvailableNumber | null>(null);

  // Step 4: Activation
  const [activating, setActivating] = useState(false);
  const [activationSteps, setActivationSteps] = useState<ActivationStep[]>([]);
  const [activationDone, setActivationDone] = useState(false);
  const [activationError, setActivationError] = useState("");

  const searchNumbers = async () => {
    if (!areaCode || areaCode.length !== 3) {
      setSearchError("Enter a valid 3-digit area code");
      return;
    }

    setSearching(true);
    setSearchError("");
    setAvailableNumbers([]);

    try {
      const res = await fetch(`/api/twilio/search-numbers?areaCode=${areaCode}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Search failed");
      }

      if (data.numbers.length === 0) {
        setSearchError("No numbers available for this area code. Try another one.");
      } else {
        setAvailableNumbers(data.numbers);
      }
    } catch (err: any) {
      setSearchError(err.message || "Failed to search numbers");
    } finally {
      setSearching(false);
    }
  };

  const activateLocation = async () => {
    if (!selectedNumber) return;

    setActivating(true);
    setActivationError("");
    setActivationSteps([]);

    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId: location.agency_id,
          ghlLocationId: location.ghl_location_id,
          ghlLocationName: location.ghl_location_name,
          phoneNumber: selectedNumber.phoneNumber,
          businessName,
          businessType,
        }),
      });

      const data = await res.json();

      if (data.results?.steps) {
        setActivationSteps(data.results.steps);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Activation failed");
      }

      setActivationDone(true);
    } catch (err: any) {
      setActivationError(err.message || "Activation failed");
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 text-white">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900">
                Activate AI Calling
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

          {/* Step indicators */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "h-1.5 rounded-full flex-1 transition-all duration-300",
                    s <= step ? "bg-brand-500" : "bg-gray-100"
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Business Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Business Name
                </label>
                <div className="relative">
                  <Building2
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter business name"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Business Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BUSINESS_TYPES.map((bt) => (
                    <button
                      key={bt.value}
                      onClick={() => setBusinessType(bt.value)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] font-medium transition-all",
                        businessType === bt.value
                          ? "border-brand-400 bg-brand-50 text-brand-600 shadow-sm"
                          : "border-gray-150 bg-white text-gray-600 hover:border-gray-300"
                      )}
                    >
                      <span className="text-base">{bt.icon}</span>
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Search Numbers */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Search for a local phone number by area code. This will be the
                number customers call to reach the AI assistant.
              </p>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                  <input
                    type="text"
                    value={areaCode}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 3);
                      setAreaCode(v);
                      setSearchError("");
                    }}
                    placeholder="Area code (e.g. 346)"
                    maxLength={3}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white transition-all"
                    onKeyDown={(e) => e.key === "Enter" && searchNumbers()}
                  />
                </div>
                <button
                  onClick={searchNumbers}
                  disabled={searching || areaCode.length !== 3}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {searching ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Search size={15} />
                  )}
                  Search
                </button>
              </div>

              {searchError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-600">
                  <XCircle size={14} />
                  {searchError}
                </div>
              )}

              {availableNumbers.length > 0 && (
                <div>
                  <div className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {availableNumbers.length} Numbers Available
                  </div>
                  <div className="grid gap-1.5 max-h-[280px] overflow-y-auto pr-1">
                    {availableNumbers.map((num) => (
                      <button
                        key={num.phoneNumber}
                        onClick={() => {
                          setSelectedNumber(num);
                          setStep(3);
                        }}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left group",
                          selectedNumber?.phoneNumber === num.phoneNumber
                            ? "border-brand-400 bg-brand-50"
                            : "border-gray-100 bg-white hover:border-brand-300 hover:bg-brand-50/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 group-hover:bg-brand-100 group-hover:text-brand-500 transition-colors">
                            <Phone size={16} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-800">
                              {num.friendlyName}
                            </div>
                            <div className="text-[12px] text-gray-400">
                              {num.locality}, {num.region}
                            </div>
                          </div>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-gray-300 group-hover:text-brand-500 transition-colors"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && selectedNumber && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="flex justify-center mb-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 text-white shadow-lg shadow-brand-500/25">
                    <Sparkles size={26} />
                  </div>
                </div>
                <h4 className="text-[15px] font-bold text-gray-900 mb-1">
                  Ready to Activate?
                </h4>
                <p className="text-[13px] text-gray-400">
                  Review the details below and confirm.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Location</span>
                  <span className="font-semibold text-gray-800">
                    {location.ghl_location_name}
                  </span>
                </div>
                <div className="border-t border-gray-200" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Business Name</span>
                  <span className="font-semibold text-gray-800">
                    {businessName}
                  </span>
                </div>
                <div className="border-t border-gray-200" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Type</span>
                  <span className="font-semibold text-gray-800 capitalize">
                    {businessType.replace("-", " ") || "—"}
                  </span>
                </div>
                <div className="border-t border-gray-200" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Phone Number</span>
                  <span className="font-semibold text-brand-600">
                    {selectedNumber.friendlyName}
                  </span>
                </div>
                <div className="border-t border-gray-200" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Location</span>
                  <span className="font-semibold text-gray-800">
                    {selectedNumber.locality}, {selectedNumber.region}
                  </span>
                </div>
                <div className="border-t border-gray-200" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monthly Cost</span>
                  <span className="font-semibold text-gray-800">
                    $1.50/mo (number) + usage
                  </span>
                </div>
              </div>

              <p className="text-[12px] text-gray-400 text-center leading-relaxed">
                This will purchase the phone number, create an AI assistant, and
                link them together. The AI will be ready to answer calls
                immediately.
              </p>
            </div>
          )}

          {/* Step 4: Activating / Done */}
          {step === 4 && (
            <div className="space-y-4">
              {activationSteps.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl"
                >
                  {s.status === "success" ? (
                    <CheckCircle2
                      size={18}
                      className="text-emerald-500 shrink-0"
                    />
                  ) : (
                    <XCircle size={18} className="text-red-500 shrink-0" />
                  )}
                  <span className="text-sm text-gray-700 capitalize">
                    {s.step.replace(/_/g, " ")}
                  </span>
                  {s.error && (
                    <span className="text-[11px] text-red-400 ml-auto truncate max-w-[200px]">
                      {s.error}
                    </span>
                  )}
                </div>
              ))}

              {activating && (
                <div className="flex flex-col items-center py-6 gap-3">
                  <Loader2 size={28} className="animate-spin text-brand-500" />
                  <span className="text-sm text-gray-400">
                    Activating AI calling...
                  </span>
                </div>
              )}

              {activationDone && (
                <div className="text-center py-4">
                  <div className="flex justify-center mb-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                      <CheckCircle2 size={28} />
                    </div>
                  </div>
                  <h4 className="text-[15px] font-bold text-gray-900 mb-1">
                    Activation Complete!
                  </h4>
                  <p className="text-[13px] text-gray-400">
                    {businessName} is now live with AI calling at{" "}
                    <span className="font-semibold text-brand-600">
                      {selectedNumber?.friendlyName}
                    </span>
                  </p>
                </div>
              )}

              {activationError && (
                <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-600">
                  {activationError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          {step === 1 && (
            <>
              <button
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!businessName || !businessType}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Choose Number
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronLeft size={16} />
                Back
              </button>
              <div className="text-[12px] text-gray-300">
                Click a number to continue
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronLeft size={16} />
                Back
              </button>
              <button
                onClick={() => {
                  setStep(4);
                  activateLocation();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all"
              >
                <Zap size={16} />
                Activate Now
              </button>
            </>
          )}

          {step === 4 && activationDone && (
            <>
              <div />
              <button
                onClick={onSuccess}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors"
              >
                <CheckCircle2 size={16} />
                Done
              </button>
            </>
          )}

          {step === 4 && activationError && !activating && (
            <>
              <button
                onClick={() => {
                  setStep(3);
                  setActivationError("");
                  setActivationSteps([]);
                }}
                className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronLeft size={16} />
                Back
              </button>
              <button
                onClick={() => {
                  setActivationError("");
                  setActivationSteps([]);
                  activateLocation();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors"
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
