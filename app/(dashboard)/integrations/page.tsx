import { IntegrationsGrid } from "@/components/integrations/integrations-grid";

export default function IntegrationsPage() {
  return (
    <div className="p-7">
      <h2 className="text-lg font-bold text-brand-900 mb-1">Integrations</h2>
      <p className="text-[13px] text-gray-400 mb-5">
        Manage your connected services. Twilio and VAPI are abstracted and
        managed by Sylon.
      </p>
      <IntegrationsGrid />
    </div>
  );
}
