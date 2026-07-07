// Tiny dependency-free SVG charts.

export function BarChart({ data, height = 180, valueLabel }: {
  data: { label: string; value: number }[];
  height?: number;
  valueLabel?: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="w-full">
      <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
        {data.map((d, i) => {
          const h = Math.max(4, (d.value / max) * (height - 32));
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end group">
              <div className="text-[10px] font-semibold text-[#4A0E16] mb-1 opacity-0 group-hover:opacity-100 transition">
                {valueLabel ? valueLabel(d.value) : d.value}
              </div>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-[#4A0E16] to-[#8a1e2e] transition-all hover:opacity-90"
                style={{ height: h }}
                title={`${d.label}: ${valueLabel ? valueLabel(d.value) : d.value}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 sm:gap-3 mt-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[10px] font-medium text-gray-500 truncate">{d.label}</div>
        ))}
      </div>
    </div>
  );
}

export function LineChart({ data, height = 180, color = "#4A0E16", valueLabel }: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  valueLabel?: (v: number) => string;
}) {
  const W = 600;
  const H = height;
  const padX = 30;
  const padY = 20;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = data.length > 1 ? (W - padX * 2) / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padX + i * step;
    const y = H - padY - (d.value / max) * (H - padY * 2);
    return [x, y] as const;
  });

  const path = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");
  const area = `${path} L ${points[points.length - 1]?.[0] || padX} ${H - padY} L ${padX} ${H - padY} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lcg)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r="4" fill="white" stroke={color} strokeWidth="2"/>
            <title>{`${data[i].label}: ${valueLabel ? valueLabel(data[i].value) : data[i].value}`}</title>
          </g>
        ))}
      </svg>
      <div className="flex gap-1 mt-1">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[10px] font-medium text-gray-500 truncate">{d.label}</div>
        ))}
      </div>
    </div>
  );
}
