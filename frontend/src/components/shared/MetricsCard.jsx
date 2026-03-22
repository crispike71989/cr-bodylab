import { S } from "../../App.jsx";
import { bmiCategory } from "../../utils/metrics.js";

export default function MetricsCard({ metrics, goal }) {
  if (!metrics) return null;
  const cat = bmiCategory(metrics.bmi);
  const bars = [
    { label: "Grasa",   value: metrics.fatPct,    color: "#FF9E80", icon: "🔥" },
    { label: "Músculo", value: metrics.musclePct,  color: "#A8FFD8", icon: "💪" },
    { label: "Agua",    value: metrics.waterPct,   color: "#BAD8FF", icon: "💧" },
  ];
  return (
    <div style={{ ...S.card, cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 4 }}>PESO ACTUAL</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{metrics.weight}<span style={{ fontSize: 14, color: "#7AA0C8", fontWeight: 400 }}> kg</span></div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 4 }}>BMI</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: cat.color }}>{metrics.bmi}</div>
          <div style={{ fontSize: 11, color: cat.color }}>{cat.label}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {bars.map((b) => (
          <div key={b.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#777" }}>{b.icon} {b.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>{b.value}%</span>
            </div>
            <div style={{ height: 6, background: "#0A1225", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(b.value, 100)}%`, background: b.color, borderRadius: 3, transition: "width 0.6s ease" }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, fontSize: 12, color: "#6B91BB" }}>Altura: {metrics.height} cm</div>
    </div>
  );
}
