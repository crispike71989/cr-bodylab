import { useState } from "react";
import { METHODS, MiniChart } from "../../App.jsx";

export default function ExerciseDetailView({ group, student, progressData, setProgressData, weightLog, setWeightLog, routines, setRoutines, onBack }) {
  const method = group.method ? METHODS[group.method] : null;
  const [editingSeriesExId, setEditingSeriesExId] = useState(null);
  const [editSeriesData,    setEditSeriesData]    = useState([]);
  const [progressionExId,  setProgressionExId]   = useState(null);
  const [progressionEx,    setProgressionEx]     = useState(null);

  const liveItems = group.items.map(ex => {
    const live = (routines[student.id] || []).find(r => r.id === ex.id);
    return live || ex;
  });

  const saveSeriesProgress = (ex, seriesData, dateToUse) => {
    const clean = seriesData.filter(s => !s._date);
    const newEntry = {
      date: dateToUse,
      exercise: ex.exercise,
      weight: Math.max(...clean.map(s => s.weight || 0), 0),
      reps: clean[0]?.reps || 0,
      seriesData: clean,
    };
    setProgressData(prev => ({
      ...prev,
      [student.id]: [...(prev[student.id] || []), newEntry],
    }));
  };

  // ── PROGRESSION VIEW ──────────────────────────────────────────────────────
  if (progressionEx) {
    const history = (progressData[student.id] || []).filter(p => p.exercise === progressionEx.exercise && p.seriesData?.length > 0);
    const sorted  = [...history].sort((a, b) => a.date.localeCompare(b.date));
    const maxSeries = Math.max(...sorted.map(p => p.seriesData?.length || 0), progressionEx.sets || 3);

    const W = 320, H = 150, padL = 36, padB = 28, padT = 20, padR = 12;
    const toX = (i, n) => padL + (n <= 1 ? (W - padL - padR) / 2 : (i / (n - 1)) * (W - padL - padR));

    const SeriesChart = ({ serieIdx }) => {
      const pts = sorted.map(p => ({
        date:   p.date.slice(5),
        weight: p.seriesData?.[serieIdx]?.weight ?? 0,
        reps:   p.seriesData?.[serieIdx]?.reps   ?? 0,
      })).filter(p => p.weight > 0 || p.reps > 0);

      if (pts.length < 1) return null;

      const maxW = Math.max(...pts.map(p => p.weight), 1);
      const maxR = Math.max(...pts.map(p => p.reps),   1);
      const n    = pts.length;
      const toYW = v => padT + (1 - v / maxW) * (H - padT - padB);
      const toYR = v => padT + (1 - v / maxR) * (H - padT - padB);
      const polyW = pts.map((p, i) => `${toX(i, n)},${toYW(p.weight)}`).join(" ");
      const polyR = pts.map((p, i) => `${toX(i, n)},${toYR(p.reps)}`).join(" ");

      return (
        <div style={{ background: "#070C18", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#B8D4F0", letterSpacing: 1, marginBottom: 12 }}>SERIE {serieIdx + 1}</div>
          <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 20, height: 3, background: "#5BB8F5", borderRadius: 2 }} />
              <span style={{ fontSize: 10, color: "#5BB8F5", fontWeight: 700 }}>PESO (kg)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 20, height: 0, borderTop: "2px dashed #A8FFD8" }} />
              <span style={{ fontSize: 10, color: "#A8FFD8", fontWeight: 700 }}>REPS</span>
            </div>
          </div>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id={`gW${serieIdx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5BB8F5" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#5BB8F5" stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`gR${serieIdx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A8FFD8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#A8FFD8" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 0.5, 1].map(v => (
              <line key={v} x1={padL} y1={padT + v * (H - padT - padB)} x2={W - padR} y2={padT + v * (H - padT - padB)} stroke="#0A1225" strokeWidth="1" />
            ))}
            {[0, 0.5, 1].map(v => (
              <text key={v} x={padL - 5} y={padT + (1 - v) * (H - padT - padB) + 4} textAnchor="end" fontSize="9" fill="#5BB8F5">{Math.round(maxW * v)}</text>
            ))}
            {[0, 0.5, 1].map(v => (
              <text key={v} x={W - padR + 5} y={padT + (1 - v) * (H - padT - padB) + 4} textAnchor="start" fontSize="9" fill="#A8FFD8">{Math.round(maxR * v)}</text>
            ))}
            {n > 1 && <polygon points={`${toX(0,n)},${H-padB} ${polyW} ${toX(n-1,n)},${H-padB}`} fill={`url(#gW${serieIdx})`} />}
            {n > 1 && <polygon points={`${toX(0,n)},${H-padB} ${polyR} ${toX(n-1,n)},${H-padB}`} fill={`url(#gR${serieIdx})`} />}
            {n > 1 && <polyline points={polyW} fill="none" stroke="#5BB8F5" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
            {n > 1 && <polyline points={polyR} fill="none" stroke="#A8FFD8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="5,3" />}
            {pts.map((p, i) => (
              <g key={i}>
                <circle cx={toX(i,n)} cy={toYW(p.weight)} r="4" fill="#5BB8F5" stroke="#070C18" strokeWidth="2" />
                <circle cx={toX(i,n)} cy={toYR(p.reps)}   r="4" fill="#A8FFD8" stroke="#070C18" strokeWidth="2" />
                <text x={toX(i,n)} y={H - 8} textAnchor="middle" fontSize="9" fill="#527BA8">{p.date}</text>
              </g>
            ))}
          </svg>
          <div style={{ marginTop: 12, borderTop: "1px solid #2F3D30", paddingTop: 10 }}>
            {[...pts].reverse().map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < pts.length - 1 ? "1px solid #2F3D30" : "none" }}>
                <span style={{ fontSize: 12, color: "#B8D4F0" }}>{p.date}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#5BB8F5" }}>{p.weight > 0 ? `${p.weight} kg` : "PC"}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#A8FFD8" }}>{p.reps} reps</span>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div style={{ minHeight: "100vh", background: "#0A0F1E" }}>
        <div style={{ background: "#0B1428", borderBottom: "1px solid #354037", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
          <button onClick={() => setProgressionEx(null)} style={{ background: "none", border: "none", color: "#5BB8F5", fontSize: 22, cursor: "pointer", padding: 0, lineHeight: 1 }}>←</button>
          <div>
            <div style={{ fontSize: 10, color: "#A8FFD8", letterSpacing: 2, fontWeight: 700 }}>📈 PROGRESIÓN</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#B8D4F0" }}>{progressionEx.exercise}</div>
          </div>
        </div>
        <div style={{ padding: "20px 16px 100px" }}>
          {sorted.length === 0 ? (
            <div style={{ background: "#070C18", borderRadius: 14, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#B8D4F0", marginBottom: 6 }}>Sin datos aún</div>
              <div style={{ fontSize: 13, color: "#7AA0C8" }}>Guardá pesos en "Actualizar pesos" para ver tu evolución</div>
            </div>
          ) : (
            Array.from({ length: maxSeries }).map((_, si) => <SeriesChart key={si} serieIdx={si} />)
          )}
        </div>
      </div>
    );
  }

  // ── EXERCISE DETAIL ───────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1E" }}>
      <div style={{ background: "#0B1428", borderBottom: "1px solid #354037", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#5BB8F5", fontSize: 22, cursor: "pointer", padding: 0, lineHeight: 1 }}>←</button>
        <div style={{ flex: 1 }}>
          {method
            ? <span style={{ background: `${method.color}22`, color: method.color, fontSize: 11, padding: "3px 10px", borderRadius: 4, fontWeight: 700 }}>{method.emoji} {method.label}</span>
            : null}
          <div style={{ fontWeight: 800, fontSize: 17, marginTop: method ? 4 : 0, color: "#B8D4F0" }}>
            {group.items.map(e => e.exercise).join(" + ")}
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 16px 100px" }}>
        {liveItems.map((ex, idx) => {
          const hasSeries    = ex.seriesData?.length > 0;
          const displayData  = hasSeries
            ? ex.seriesData
            : Array.from({ length: ex.sets || 3 }, () => ({ reps: ex.reps || 10, weight: ex.weight || 0 }));
          const accentColor  = method ? method.color : "#5BB8F5";

          return (
            <div key={ex.id} style={{ marginBottom: 20 }}>
              {(ex.imageCustom || ex.imageUrl) && (
                <div style={{ width: "100%", height: 220, borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
                  <img src={ex.imageCustom || ex.imageUrl} alt={ex.exercise} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                </div>
              )}

              {liveItems.length > 1 && (
                <div style={{ fontSize: 11, color: accentColor, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>EJERCICIO {idx + 1}</div>
              )}
              <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 12, color: "#B8D4F0" }}>{ex.exercise}</div>

              <div style={{ background: "#070C18", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
                {editingSeriesExId === ex.id ? (
                  <div style={{ padding: 14 }}>
                    <div style={{ fontSize: 10, color: "#B8D4F0", letterSpacing: 2, marginBottom: 6 }}>FECHA DEL REGISTRO</div>
                    <input
                      style={{ background: "#0B1428", border: "1px solid #354037", color: "#B8D4F0", padding: "8px 12px", borderRadius: 8, fontSize: 13, width: "100%", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 12 }}
                      type="date" value={editSeriesData._date || new Date().toISOString().slice(0, 10)}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={e => setEditSeriesData(prev => { const n = [...prev]; n._date = e.target.value; return n; })} />

                    <div style={{ display: "grid", gridTemplateColumns: ex.method === "restpause" ? "32px 1fr 14px 1fr 1fr" : "32px 1fr 1fr", gap: 8, marginBottom: 6 }}>
                      <div />
                      <div style={{ fontSize: 10, color: "#B8D4F0", letterSpacing: 2, textAlign: "center" }}>{ex.method === "restpause" ? "REPS 1" : "REPS"}</div>
                      {ex.method === "restpause" && <div style={{ fontSize: 10, color: "#e879f9", textAlign: "center" }}>+</div>}
                      {ex.method === "restpause" && <div style={{ fontSize: 10, color: "#B8D4F0", letterSpacing: 2, textAlign: "center" }}>REPS 2</div>}
                      <div style={{ fontSize: 10, color: "#B8D4F0", letterSpacing: 2, textAlign: "center" }}>KG</div>
                    </div>
                    {editSeriesData.map((s, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: ex.method === "restpause" ? "32px 1fr 14px 1fr 1fr" : "32px 1fr 1fr", gap: 8, alignItems: "center", marginBottom: 8 }}>
                        <div style={{ background: `${accentColor}22`, color: accentColor, borderRadius: 6, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{i + 1}</div>
                        <input style={{ background: "#0B1428", border: "1px solid #354037", color: "#B8D4F0", padding: "8px", borderRadius: 8, fontSize: 14, textAlign: "center", fontFamily: "inherit" }}
                          type="number" value={s.reps} onChange={e => setEditSeriesData(prev => prev.map((sd, j) => j === i ? { ...sd, reps: Number(e.target.value) } : sd))} />
                        {ex.method === "restpause" && <div style={{ color: "#e879f9", textAlign: "center", fontWeight: 700, fontSize: 16 }}>+</div>}
                        {ex.method === "restpause" && (
                          <input style={{ background: "#0B1428", border: "1px solid #354037", color: "#B8D4F0", padding: "8px", borderRadius: 8, fontSize: 14, textAlign: "center", fontFamily: "inherit" }}
                            type="number" value={s.reps2 ?? 2} onChange={e => setEditSeriesData(prev => prev.map((sd, j) => j === i ? { ...sd, reps2: Number(e.target.value) } : sd))} />
                        )}
                        <input style={{ background: "#0B1428", border: "1px solid #354037", color: "#B8D4F0", padding: "8px", borderRadius: 8, fontSize: 14, textAlign: "center", fontFamily: "inherit" }}
                          type="number" value={s.weight} onChange={e => setEditSeriesData(prev => prev.map((sd, j) => j === i ? { ...sd, weight: Number(e.target.value) } : sd))} />
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button
                        style={{ flex: 1, background: "#5BB8F5", color: "#070C18", border: "none", padding: "10px 0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                        onClick={() => {
                          const today = new Date().toISOString().slice(0, 10);
                          const dateToUse = editSeriesData._date || today;
                          const cleanData = editSeriesData.map(({ _date, ...s }) => s);
                          setRoutines(prev => ({
                            ...prev,
                            [student.id]: (prev[student.id] || []).map(e => e.id === ex.id ? { ...e, seriesData: cleanData } : e),
                          }));
                          saveSeriesProgress(ex, editSeriesData, dateToUse);
                          setEditingSeriesExId(null);
                        }}>Guardar</button>
                      <button
                        style={{ flex: 1, background: "#0A1225", color: "#B8D4F0", border: "1px solid #354037", padding: "10px 0", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                        onClick={() => setEditingSeriesExId(null)}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: 14 }}>
                    {displayData.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ background: `${accentColor}22`, color: accentColor, borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#B8D4F0" }}>{ex.method === "restpause" ? `${s.reps} + ${s.reps2 ?? 2} reps` : `${s.reps} reps`}</span>
                          <span style={{ color: "#7AA0C8", fontSize: 13 }}> · </span>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#5BB8F5" }}>{s.weight > 0 ? `${s.weight} kg` : "Peso corporal"}</span>
                        </div>
                      </div>
                    ))}
                    <button
                      style={{ width: "100%", background: "#5BB8F511", border: "1px solid #5BB8F544", color: "#5BB8F5", padding: "10px 0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}
                      onClick={() => {
                        const d = [...displayData];
                        d._date = new Date().toISOString().slice(0, 10);
                        setEditSeriesData(d);
                        setEditingSeriesExId(ex.id);
                      }}>
                      ✏️ Actualizar pesos
                    </button>
                  </div>
                )}
              </div>

              <button onClick={() => setProgressionEx(ex)}
                style={{ width: "100%", background: "#A8FFD811", border: "1px solid #A8FFD844", color: "#A8FFD8", padding: "10px 0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>
                📈 Ver Progresión
              </button>

              {idx < liveItems.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
                  <div style={{ flex: 1, height: 1, background: `${accentColor}33` }} />
                  <span style={{ background: `${accentColor}22`, color: accentColor, fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 20, border: `1px solid ${accentColor}55` }}>{method?.emoji} + {method?.emoji}</span>
                  <div style={{ flex: 1, height: 1, background: `${accentColor}33` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
