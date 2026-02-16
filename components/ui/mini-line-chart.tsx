"use client";

import type { ChartDataPoint } from "@/types";

interface MiniLineChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
}

export function MiniLineChart({
  data,
  width = 340,
  height = 200,
}: MiniLineChartProps) {
  const max = Math.max(...data.map((d) => d.calls));
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - (d.calls / max) * chartH,
    ...d,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  const peak = points.reduce((a, b) => (a.calls > b.calls ? a : b));

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6C5CE7" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = padding.top + chartH * (1 - t);
        return (
          <g key={i}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#f0f0f5"
              strokeWidth={1}
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              fontSize={11}
              fill="#999"
            >
              {Math.round(max * t).toLocaleString()}
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill="url(#chartGrad)" />
      <path
        d={linePath}
        fill="none"
        stroke="#6C5CE7"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Points + labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r={4}
            fill="#fff"
            stroke="#6C5CE7"
            strokeWidth={2}
          />
          <text
            x={p.x}
            y={padding.top + chartH + 20}
            textAnchor="middle"
            fontSize={11}
            fill="#999"
          >
            {p.day}
          </text>
        </g>
      ))}

      {/* Tooltip on peak */}
      <rect
        x={peak.x - 48}
        y={peak.y - 42}
        width={96}
        height={32}
        rx={8}
        fill="#1a1a2e"
      />
      <text
        x={peak.x}
        y={peak.y - 22}
        textAnchor="middle"
        fontSize={12}
        fill="#fff"
        fontWeight={600}
      >
        {peak.calls} Calls
      </text>
    </svg>
  );
}
