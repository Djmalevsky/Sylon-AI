export default function SettingsPage() {
  const fields = [
    { label: "Agency Name", value: "Alice's Marketing Agency" },
    { label: "Email", value: "alice@agency.com" },
    { label: "Plan", value: "Pro" },
  ];

  return (
    <div className="p-7">
      <h2 className="text-lg font-bold text-brand-900 mb-5">Settings</h2>

      <div className="card p-6 max-w-xl">
        <h3 className="text-base font-bold text-brand-900 mb-5">
          Agency Profile
        </h3>

        {fields.map((field, i) => (
          <div key={i} className="mb-4">
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">
              {field.label}
            </label>
            <input
              defaultValue={field.value}
              className="w-full rounded-[10px] border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
            />
          </div>
        ))}

        <button className="btn-primary mt-2">Save Changes</button>
      </div>
    </div>
  );
}
