"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const EVENT_DAYS = [2, 3, 5, 7, 11, 13, 14];

export function MiniCalendar() {
  const cells = Array.from({ length: 14 }, (_, i) => i + 1);

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <button className="text-brand-500 font-semibold text-[13px] hover:underline">
            Today
          </button>
          <ChevronLeft
            size={16}
            className="text-gray-400 cursor-pointer hover:text-gray-600"
          />
          <ChevronRight
            size={16}
            className="text-gray-400 cursor-pointer hover:text-gray-600"
          />
        </div>
        <span className="font-semibold text-sm text-gray-700">May 2024</span>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-[10px] font-semibold text-gray-400 py-1 tracking-wide"
          >
            {d}
          </div>
        ))}
        {cells.map((d) => (
          <div
            key={d}
            className={`relative py-1.5 text-xs rounded-lg ${
              d === 5
                ? "text-brand-500 font-bold"
                : "text-gray-700"
            }`}
          >
            {d}
            {EVENT_DAYS.includes(d) && (
              <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
