import { Link2 } from "lucide-react";

interface IntegrationCardData {
  name: string;
  type: string;
  status: "connected" | "managed" | "disconnected";
  description: string;
  color: string;
}

interface IntegrationsGridProps {
  isClientLevel?: boolean;
}

export function IntegrationsGrid({ isClientLevel = false }: IntegrationsGridProps) {
  const integrations: IntegrationCardData[] = [
    {
      name: "GoHighLevel",
      type: "ghl",
      status: "connected",
      description: "CRM & Automation",
      color: "#00b894",
    },
    {
      name: "Twilio",
      type: "twilio",
      status: isClientLevel ? "managed" : "connected",
      description: "Call Infrastructure",
      color: "#e74c3c",
    },
    {
      name: "VAPI",
      type: "vapi",
      status: isClientLevel ? "managed" : "connected",
      description: "AI Voice Agent",
      color: "#6C5CE7",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {integrations.map((intg) => (
        <div key={intg.type} className="card p-7 text-center">
          <div
            className="mx-auto mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px]"
            style={{ backgroundColor: `${intg.color}15` }}
          >
            <Link2 size={22} color={intg.color} />
          </div>

          <h4 className="text-[15px] font-bold text-brand-900 mb-1">
            {intg.name}
          </h4>
          <p className="text-xs text-gray-400 mb-3.5">{intg.description}</p>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              intg.status === "connected"
                ? "bg-emerald-500/10 text-emerald-600"
                : intg.status === "managed"
                  ? "bg-brand-500/10 text-brand-500"
                  : "bg-gray-100 text-gray-500"
            }`}
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                intg.status === "connected"
                  ? "bg-emerald-500"
                  : intg.status === "managed"
                    ? "bg-brand-500"
                    : "bg-gray-400"
              }`}
            />
            {intg.status === "managed" ? "Backend Managed" : "Connected"}
          </div>

          {!isClientLevel && intg.type === "ghl" && (
            <button className="mt-3.5 block mx-auto btn-secondary text-xs py-2 px-5">
              Reconnect OAuth
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
