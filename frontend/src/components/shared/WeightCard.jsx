import { useState } from "react";
import { S } from "../../App.jsx";
import { bmiCategory } from "../../utils/metrics.js";
import WeightChart from "./WeightChart.jsx";

export default function WeightCard({ studentId, metrics, weightLog, setWeightLog, setStudents, canEdit = true }) {
  const [newWeight, setNewWeight] = useState("");
  const [newFat,    setNewFat]    = useState("");
  const [newMuscle, setNewMuscle] = useState("");
  const [newWater,  setNewWater]  = useState("");
  const [newWaist,  setNewWaist]  = useState("");
  const [newDate,   setNewDate]   = useState(new Date().toISOString().slice(0, 10));
  const [showForm,  setShowForm]  = useState(false);
  const [showLog,   setShowLog]   = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const log   = weightLog[studentId] || [];
  const today = new Date().toISOString().slice(0, 10);

  const saveMetrics = () => {
    const weight = parseFloat(newWeight);
    if (!weight && !newFat && !newMuscle && !newWater && !newWaist) return;
    const entryDate = newDate || today;
    if (weight && weight > 20 && weight < 300) {
      const newEntry = { date: entryDate, weight };
      const sorted = [...(weightLog[studentId] || []), newEntry].sort((a, b) => a.date.localeCompare(b.date));
      setWeightLog(prev => ({ ...prev, [studentId]: sorted }));
    }
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const currentMetrics = s.metrics || {};
      const h = currentMetrics.height;
      const w = weight || currentMetrics.weight;
      const bmi = w && h ? parseFloat((w / ((h / 100) ** 2)).toFixed(1)) : currentMetrics.bmi;
      return {
        ...s, metrics: {
          ...currentMetrics,
          weight:    weight || currentMetrics.weight,
          bmi,
          fatPct:    newFat    ? Number(newFat)    : currentMetrics.fatPct,
          musclePct: newMuscle ? Number(newMuscle) : currentMetrics.musclePct,
          waterPct:  newWater  ? Number(newWater)  : currentMetrics.waterPct,
          waist:     newWaist  ? Number(newWaist)  : currentMetrics.waist,
        },
      };
    }));
    setNewWeight(""); setNewFat(""); setNewMuscle(""); setNewWater(""); setNewWaist("");
    setNewDate(today);
    setShowForm(false);
  };

  const saveEditEntry = () => {
    if (!editingEntry) return;
    const updated = log
      .map((e, i) => i === editingEntry.index ? { date: editingEntry.date, weight: parseFloat(editingEntry.weight) } : e)
      .sort((a, b) => a.date.localeCompare(b.date));
    setWeightLog(prev => ({ ...prev, [studentId]: updated }));
    setEditingEntry(null);
  };

  const deleteEntry = (idx) => {
    const updated = log.filter((_, i) => i !== idx);
    setWeightLog(prev => ({ ...prev, [studentId]: updated }));
  };

  const current = log.length > 0 ? log[log.length - 1] : null;
  const first   = log.length > 0 ? log[0] : null;
  const delta   = (current && first && log.length > 1) ? (current.weight - first.weight).toFixed(1) : null;
  const cat     = metrics?.bmi ? bmiCategory(metrics.bmi) : null;

  return (
    <div style={{ ...S.card, cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2 }}>PESO Y COMPOSICIÓN</div>
        {canEdit && (
          <button onClick={() => setShowForm(!showForm)}
            style={{ background: showForm ? "#5BB8F5" : "#0B1428", color: showForm ? "#070C18" : "#5BB8F5", border: "1px solid #5BB8F544", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
            {showForm ? "✕ Cancelar" : "+ Actualizar"}
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ background: "#070C18", borderRadius: 10, padding: "10px 12px", border: "1px solid #5BB8F533" }}>
          <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 1, marginBottom: 2 }}>PESO</div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>
            {current?.weight ?? metrics?.weight ?? "—"}
            <span style={{ fontSize: 13, color: "#7AA0C8", fontWeight: 400 }}> kg</span>
          </div>
          {delta && (
            <div style={{ fontSize: 11, marginTop: 4, color: parseFloat(delta) < 0 ? "#A8FFD8" : "#FF9E80", fontWeight: 700 }}>
              {parseFloat(delta) < 0 ? "▼" : "▲"} {Math.abs(delta)} kg
            </div>
          )}
          {current && <div style={{ fontSize: 10, color: "#527BA8", marginTop: 4 }}>{current.date}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          {cat && (
            <>
              <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 1, marginBottom: 2 }}>IMC</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: cat.color }}>{metrics.bmi}</div>
              <div style={{ fontSize: 10, color: cat.color }}>{cat.label}</div>
            </>
          )}
          {metrics?.waist && (
            <div style={{ marginTop: 6, fontSize: 11, color: "#6B91BB" }}>
              Cintura: <span style={{ color: "#B8D4F0", fontWeight: 700 }}>{metrics.waist} cm</span>
            </div>
          )}
        </div>
      </div>

      {metrics && (metrics.fatPct || metrics.musclePct || metrics.waterPct) ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { label: "Grasa",   val: metrics.fatPct,    color: "#FF9E80", icon: "🔥" },
            { label: "Músculo", val: metrics.musclePct,  color: "#A8FFD8", icon: "💪" },
            { label: "Agua",    val: metrics.waterPct,   color: "#BAD8FF", icon: "💧" },
          ].map(b => b.val ? (
            <div key={b.label} style={{ background: "#070C18", border: `1px solid ${b.color}55`, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 14 }}>{b.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: b.color, marginTop: 2 }}>{b.val}<span style={{ fontSize: 10 }}>%</span></div>
              <div style={{ fontSize: 9, color: "#B8D4F0", marginTop: 1 }}>{b.label}</div>
            </div>
          ) : null)}
        </div>
      ) : null}

      {log.length >= 2 && <div style={{ marginBottom: 14 }}><WeightChart log={log} /></div>}
      {log.length === 1 && <div style={{ fontSize: 11, color: "#527BA8", marginBottom: 12, textAlign: "center" }}>Registrá más pesajes para ver la evolución 📈</div>}

      {showForm && canEdit && (
        <div style={{ background: "#070C18", border: "1px solid #5BB8F544", borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={S.sectionTitle}>FECHA DEL REGISTRO</div>
            <input style={{ ...S.input, fontSize: 14 }} type="date" value={newDate}
              onChange={e => setNewDate(e.target.value)} max={today} />
            {newDate !== today && (
              <div style={{ fontSize: 10, color: "#fbbf24", marginTop: 5 }}>📅 Registrando para una fecha pasada</div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div>
              <div style={S.sectionTitle}>PESO (KG)</div>
              <input style={S.input} type="number" placeholder="ej: 73.5" value={newWeight} onChange={e => setNewWeight(e.target.value)} />
            </div>
            <div>
              <div style={S.sectionTitle}>CINTURA (CM)</div>
              <input style={S.input} type="number" placeholder="ej: 78" value={newWaist} onChange={e => setNewWaist(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: "#FF9E80", letterSpacing: 1, marginBottom: 6 }}>🔥 GRASA %</div>
              <input style={S.input} type="number" placeholder={metrics?.fatPct || "20"} value={newFat} onChange={e => setNewFat(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#A8FFD8", letterSpacing: 1, marginBottom: 6 }}>💪 MÚSCULO %</div>
              <input style={S.input} type="number" placeholder={metrics?.musclePct || "40"} value={newMuscle} onChange={e => setNewMuscle(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#BAD8FF", letterSpacing: 1, marginBottom: 6 }}>💧 AGUA %</div>
              <input style={S.input} type="number" placeholder={metrics?.waterPct || "55"} value={newWater} onChange={e => setNewWater(e.target.value)} />
            </div>
          </div>
          <button style={{ ...S.btn, width: "100%" }} onClick={saveMetrics}>Guardar</button>
          <div style={{ fontSize: 10, color: "#527BA8", marginTop: 8, textAlign: "center" }}>Solo completá los campos que cambiaron</div>
        </div>
      )}

      {log.length > 0 && (
        <button onClick={() => setShowLog(!showLog)}
          style={{ background: "none", border: "none", color: "#6B91BB", cursor: "pointer", fontSize: 11, fontFamily: "inherit", padding: 0 }}>
          {showLog ? "▲ Ocultar historial" : `▼ Historial de peso (${log.length} registros)`}
        </button>
      )}
      {showLog && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          {[...log].map((entry, i) => {
            const origIdx = log.indexOf(entry);
            const isEditing = editingEntry?.index === origIdx;
            return (
              <div key={i} style={{ background: "#070C18", border: "1px solid #1e1e1e", borderRadius: 8, overflow: "hidden" }}>
                {isEditing ? (
                  <div style={{ padding: "10px 10px 8px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                      <div>
                        <div style={S.sectionTitle}>FECHA</div>
                        <input style={S.input} type="date" value={editingEntry.date} max={today}
                          onChange={e => setEditingEntry(p => ({ ...p, date: e.target.value }))} />
                      </div>
                      <div>
                        <div style={S.sectionTitle}>PESO (KG)</div>
                        <input style={S.input} type="number" value={editingEntry.weight}
                          onChange={e => setEditingEntry(p => ({ ...p, weight: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={{ ...S.btn, flex: 1, padding: "8px 0", fontSize: 12 }} onClick={saveEditEntry}>Guardar</button>
                      <button style={{ ...S.btnSecondary, flex: 1, padding: "8px 0", fontSize: 12 }} onClick={() => setEditingEntry(null)}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#7AA0C8" }}>{entry.date}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#5BB8F5", marginLeft: 12 }}>{entry.weight} kg</span>
                    </div>
                    {canEdit && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setEditingEntry({ index: origIdx, date: entry.date, weight: entry.weight })}
                          style={{ background: "none", border: "none", color: "#6B91BB", cursor: "pointer", fontSize: 13, padding: "2px 4px" }}>✏️</button>
                        <button onClick={() => deleteEntry(origIdx)}
                          style={{ background: "none", border: "none", color: "#456E9E", cursor: "pointer", fontSize: 13, padding: "2px 4px" }}>🗑️</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
