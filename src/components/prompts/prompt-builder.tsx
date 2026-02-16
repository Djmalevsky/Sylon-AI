"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { PROMPT_TEMPLATES } from "@/lib/mock-data";

export function PromptBuilder() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [prompt, setPrompt] = useState(PROMPT_TEMPLATES[0].prompt);
  const [variables, setVariables] = useState([
    { key: "clinic_name", value: "Bright Smile Dental" },
    { key: "booking_url", value: "https://calendly.com/brightsmile" },
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
      {/* Editor */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-brand-900 mb-4">
          System Prompt
        </h3>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Template
          </label>
          <select
            value={selectedIdx}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setSelectedIdx(idx);
              setPrompt(PROMPT_TEMPLATES[idx].prompt);
            }}
            className="w-full rounded-[10px] border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
          >
            {PROMPT_TEMPLATES.map((t, i) => (
              <option key={t.id} value={i}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Prompt Editor
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={10}
            className="w-full rounded-[10px] border border-gray-200 px-3.5 py-3 text-[13px] text-gray-700 leading-relaxed outline-none resize-y focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 font-sans transition-all"
          />
        </div>

        <div className="flex gap-2.5">
          <button className="btn-primary">
            <Save size={14} />
            Save & Activate
          </button>
          <button className="btn-secondary">Test Prompt</button>
        </div>
      </div>

      {/* Variables */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-brand-900 mb-4">Variables</h3>
        <p className="text-xs text-gray-400 mb-4">
          Use <code className="bg-gray-100 px-1 rounded text-brand-500">{"{{variable_name}}"}</code> in
          your prompt to insert dynamic values.
        </p>

        {variables.map((v, i) => (
          <div key={i} className="mb-3">
            <label className="block text-[11px] font-semibold text-gray-400 mb-1">
              {`{{${v.key}}}`}
            </label>
            <input
              value={v.value}
              onChange={(e) => {
                const next = [...variables];
                next[i] = { ...next[i], value: e.target.value };
                setVariables(next);
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] text-gray-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
            />
          </div>
        ))}

        <button className="mt-1 w-full rounded-lg border border-dashed border-gray-300 py-2 text-xs font-semibold text-brand-500 hover:border-brand-500 hover:bg-brand-50 transition-all">
          + Add Variable
        </button>
      </div>
    </div>
  );
}
