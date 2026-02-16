export default function BillingPage() {
  const cards = [
    { label: "Current Plan", value: "Pro", sub: "$299/mo" },
    { label: "Calls This Month", value: "4,231", sub: "of 10,000 included" },
    { label: "Next Billing", value: "Mar 1", sub: "Auto-renew enabled" },
  ];

  return (
    <div className="p-7">
      <h2 className="text-lg font-bold text-brand-900 mb-5">
        Billing & Usage
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {cards.map((item, i) => (
          <div key={i} className="card p-5">
            <div className="text-xs text-gray-400 mb-1.5">{item.label}</div>
            <div className="text-2xl font-bold text-brand-900">{item.value}</div>
            <div className="text-xs text-brand-500 mt-1">{item.sub}</div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="text-base font-bold text-brand-900 mb-1">
          Usage Meter
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          4,231 of 10,000 calls used this billing cycle
        </p>
        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
            style={{ width: "42%" }}
          />
        </div>
      </div>
    </div>
  );
}
