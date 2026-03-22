export default function WeightChart({ log }) {
  if (!log || log.length < 2) return null;
  const sorted = [...log].sort((a, b) => a.date.localeCompare(b.date));
  const W = 300, H = 80, padL = 8, padR = 8, padT = 16, padB = 20;
  const weights = sorted.map(d => d.weight);
  const minW = Math.min(...weights) - 0.5;
  const maxW = Math.max(...weights) + 0.5;
  const toX = i => padL + (i / (sorted.length - 1)) * (W - padL - padR);
  const toY = v => padT + (1 - (v - minW) / (maxW - minW)) * (H - padT - padB);
  const poly = sorted.map((p, i) => `${toX(i)},${toY(p.weight)}`).join(" ");
  const first = sorted[0], last = sorted[sorted.length - 1];
  const delta = (last.weight - first.weight).toFixed(1);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#527BA8" }}>{first.date.slice(5)}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#B8D4F0" }}>{first.weight} kg</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#527BA8" }}>variación</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: parseFloat(delta) < 0 ? "#A8FFD8" : "#FF9E80" }}>
            {parseFloat(delta) < 0 ? "▼" : "▲"} {Math.abs(delta)} kg
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#527BA8" }}>{last.date.slice(5)}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#5BB8F5" }}>{last.weight} kg</div>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block" }}>
        <defs>
          <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5BB8F5" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#5BB8F5" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`${toX(0)},${H-padB} ${poly} ${toX(sorted.length-1)},${H-padB}`} fill="url(#wgrad)" />
        <polyline points={poly} fill="none" stroke="#5BB8F5" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={toX(0)} cy={toY(first.weight)} r="4" fill="#B8D4F0" stroke="#070C18" strokeWidth="2" />
        <circle cx={toX(sorted.length-1)} cy={toY(last.weight)} r="5" fill="#5BB8F5" stroke="#070C18" strokeWidth="2" />
      </svg>
    </div>
  );
}
