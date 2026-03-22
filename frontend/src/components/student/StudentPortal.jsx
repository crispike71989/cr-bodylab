import { useState } from "react";
import { S, GLOBAL_STYLE, METHODS, GOAL_LABELS, MiniChart, callAI } from "../../App.jsx";
import { getBillingStatus } from "../../utils/billing.js";
import { bmiCategory, fullName } from "../../utils/metrics.js";
import MetricsForm        from "../shared/MetricsForm.jsx";
import WeightCard         from "../shared/WeightCard.jsx";
import ExerciseDetailView from "../shared/ExerciseDetailView.jsx";

export default function StudentPortal({ user, students, setStudents, routines, setRoutines, progressData, setProgressData, payments, classes, weightLog, setWeightLog, onLogout, isPreview = false }) {
  const student = students.find((s) => s.id === user.id);
  const [activeTab,         setActiveTab]         = useState("body");
  const [editingMetrics,    setEditingMetrics]    = useState(false);
  const [newProgress,       setNewProgress]       = useState({ exercise: "", weight: 0, reps: 0 });
  const [selectedExercise,  setSelectedExercise]  = useState("");
  const [aiPlan,            setAiPlan]            = useState("");
  const [aiLoading,         setAiLoading]         = useState(false);
  const [activeDayIdx,      setActiveDayIdx]      = useState(0);
  const [progressionExId,   setProgressionExId]   = useState(null);
  const [expandedExId,      setExpandedExId]      = useState(null);
  const [selectedExGroup,   setSelectedExGroup]   = useState(null);

  if (!student) return null;

  if (editingMetrics) {
    return <MetricsForm student={student} isOnboarding={false}
      onSave={({ goal, metrics, trainingDays, dayNames }) => {
        setStudents((prev) => prev.map((s) => s.id === student.id ? { ...s, goal, metrics, trainingDays, dayNames } : s));
        setEditingMetrics(false);
      }}
      onCancel={() => setEditingMetrics(false)} />;
  }

  const myRoutine  = routines[student.id]     || [];
  const myProgress = progressData[student.id] || [];
  const myPayments = payments[student.id]     || [];
  const myClasses  = classes[student.id]      || [];
  const billing    = student.billing;
  const hasPayments = myPayments.length > 0;
  const billStatus  = (billing || hasPayments) ? getBillingStatus(myPayments, myClasses) : null;

  const addProgress = () => {
    if (!newProgress.exercise || !newProgress.weight) return;
    setProgressData((prev) => ({ ...prev, [student.id]: [...(prev[student.id] || []), { date: new Date().toISOString().slice(0, 10), ...newProgress }] }));
    setSelectedExercise(newProgress.exercise);
    setNewProgress({ exercise: "", weight: 0, reps: 0 });
  };

  const fetchAIPlan = async () => {
    setAiLoading(true); setAiPlan("");
    const m   = student.metrics;
    const cat = bmiCategory(m.bmi);
    const prompt = `Eres un experto en entrenamiento y nutrición. Genera un plan breve y motivador (máximo 5 puntos cortos) para este alumno basado en sus datos reales.

Alumno: ${fullName(student)}, ${student.age} años
Objetivo: ${GOAL_LABELS[student.goal]}
Peso: ${m.weight}kg | Altura: ${m.height}cm | BMI: ${m.bmi} (${cat.label})
% Grasa: ${m.fatPct}% | % Músculo: ${m.musclePct}% | % Agua: ${m.waterPct}%
Ejercicios en rutina: ${myRoutine.map(e => e.exercise).join(", ") || "ninguno aún"}

Da recomendaciones específicas de entrenamiento y nutrición basadas en estos datos. Responde en español, con formato de lista numerada, directo y práctico. Sé específico con los números (calorías, proteínas, etc.).`;
    setAiPlan(await callAI(prompt));
    setAiLoading(false);
  };

  if (selectedExGroup) {
    return <ExerciseDetailView
      group={selectedExGroup}
      student={student}
      progressData={progressData}
      setProgressData={setProgressData}
      weightLog={weightLog}
      setWeightLog={setWeightLog}
      routines={routines}
      setRoutines={setRoutines}
      onBack={() => setSelectedExGroup(null)}
    />;
  }

  return (
    <div style={S.app}>
      <style>{GLOBAL_STYLE}</style>
      {isPreview && (
        <div style={{ background: "#5BB8F5", padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#000" }}>👁️ VISTA PREVIA — {student.firstName}</span>
          <button onClick={onLogout} style={{ background: "#000", color: "#5BB8F5", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>← Volver al panel</button>
        </div>
      )}
      <div style={S.header}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={S.logo}>
            <span style={{ fontSize: 28, color: "#D4A017" }}>CR </span>
            <span style={{ fontSize: 32, color: "#D4A017" }}>BODY</span>
            <span style={{ fontSize: 18, color: "#D4A017", letterSpacing: 3 }}>LAB</span>
          </div>
          <div style={S.logoSub}>MI PORTAL</div>
        </div>
        <div style={S.avatar(32)}>{student.avatar}</div>
      </div>

      <div style={S.content}>
        <div style={{ ...S.card, cursor: "default", display: "flex", gap: 12, alignItems: "center" }}>
          <div style={S.avatar(48)}>{student.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", letterSpacing: 0.5 }}>Hola, {student.firstName} 💪</div>
            <div style={{ fontSize: 12, color: "#6B91BB", marginTop: 2 }}>@{student.username}</div>
            <div style={{ marginTop: 6 }}><span style={S.goalBadge(student.goal)}>{student.goal === "perdida" ? "🔥" : "💪"} {GOAL_LABELS[student.goal] || "Sin objetivo"}</span></div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 5, background: "#0B1428", padding: 5, borderRadius: 10, marginBottom: 16, border: "1px solid #252525" }}>
          {[["body", "Cuerpo 📊"], ["routine", "Rutina"], ["billing", "Clases 💳"]].map(([t, l]) => (
            <button key={t} style={S.tab(activeTab === t)} onClick={() => setActiveTab(t)}>{l}</button>
          ))}
        </div>

        {/* BODY TAB */}
        {activeTab === "body" && (
          <>
            <WeightCard
              studentId={student.id}
              metrics={student.metrics}
              weightLog={weightLog}
              setWeightLog={setWeightLog}
              setStudents={setStudents}
              canEdit={true}
            />

            {student.metrics && (() => {
              const bars = [
                { label: "Grasa",   value: student.metrics.fatPct,    color: "#FF9E80", icon: "🔥" },
                { label: "Músculo", value: student.metrics.musclePct,  color: "#A8FFD8", icon: "💪" },
                { label: "Agua",    value: student.metrics.waterPct,   color: "#BAD8FF", icon: "💧" },
              ];
              return (
                <div style={{ ...S.card, cursor: "default" }}>
                  <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 12 }}>COMPOSICIÓN CORPORAL</div>
                  {bars.map(b => (
                    <div key={b.label} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "#777" }}>{b.icon} {b.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>{b.value}%</span>
                      </div>
                      <div style={{ height: 6, background: "#0A1225", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(b.value, 100)}%`, background: b.color, borderRadius: 3, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 10, fontSize: 12, color: "#6B91BB" }}>Altura: {student.metrics.height} cm</div>
                </div>
              );
            })()}

            {student.trainingDays && (
              <div style={{ ...S.card, cursor: "default" }}>
                <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 12 }}>MI PLAN SEMANAL</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#5BB8F5" }}>{student.trainingDays}</div>
                  <div style={{ fontSize: 13, color: "#7AA0C8" }}>días de entrenamiento por semana</div>
                </div>
                {student.dayNames?.filter(Boolean).length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {student.dayNames.map((name, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#070C18", borderRadius: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: "#5BB8F522", color: "#5BB8F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ fontSize: 13, color: "#ccc" }}>{name || `Día ${i + 1}`}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button style={{ ...S.btnSecondary, width: "100%", textAlign: "center", marginTop: 4 }} onClick={() => setEditingMetrics(true)}>✏️ Actualizar composición</button>
          </>
        )}

        {/* ROUTINE TAB */}
        {activeTab === "routine" && (() => {
          const days = (student.dayNames?.length > 0 && student.trainingDays)
            ? student.dayNames.slice(0, student.trainingDays)
            : student.trainingDays
              ? Array.from({ length: student.trainingDays }, (_, i) => `Día ${i + 1}`)
              : null;

          const filteredRoutine = days
            ? myRoutine.filter(ex => (ex.dayIndex ?? 0) === activeDayIdx)
            : myRoutine;

          const grouped = [];
          const seen = new Set();
          filteredRoutine.forEach(ex => {
            if (ex.methodGroup && (ex.method === "biserie" || ex.method === "triserie")) {
              if (!seen.has(ex.methodGroup)) {
                seen.add(ex.methodGroup);
                const groupItems = myRoutine.filter(e => e.methodGroup && e.methodGroup === ex.methodGroup);
                grouped.push({ type: "group", key: ex.methodGroup, items: groupItems, method: ex.method });
              }
            } else {
              grouped.push({ type: "single", key: String(ex.id), items: [ex] });
            }
          });

          return (
            <>
              {days && (
                <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 14 }}>
                  {days.map((name, i) => (
                    <button key={i} onClick={() => setActiveDayIdx(i)}
                      style={{ background: activeDayIdx === i ? "#5BB8F5" : "#0B1428", color: activeDayIdx === i ? "#070C18" : "#7AA0C8", border: `1px solid ${activeDayIdx === i ? "#5BB8F5" : "#0A1225"}`, padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: activeDayIdx === i ? 700 : 500, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0 }}>
                      <span style={{ fontSize: 10, opacity: 0.6, marginRight: 3 }}>D{i + 1}</span>
                      {name || `Día ${i + 1}`}
                      <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.5 }}>({myRoutine.filter(e => (e.dayIndex ?? 0) === i).length})</span>
                    </button>
                  ))}
                </div>
              )}

              {days && (
                <div style={{ background: "#0B1428", border: "1px solid #252525", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2 }}>DÍA {activeDayIdx + 1}</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{days[activeDayIdx] || `Día ${activeDayIdx + 1}`}</div>
                  </div>
                  <span style={S.accentBadge}>{filteredRoutine.length} ejercicio{filteredRoutine.length !== 1 ? "s" : ""}</span>
                </div>
              )}

              {filteredRoutine.length === 0 && <p style={{ color: "#6B91BB", textAlign: "center", padding: 24, fontSize: 13 }}>Sin ejercicios en este día.</p>}

              {grouped.map(group => {
                const method = group.method ? METHODS[group.method] : null;

                if (group.type === "group" && method) {
                  return (
                    <div key={group.key} style={{ marginBottom: 12 }}>
                      <div onClick={() => setSelectedExGroup(group)}
                        style={{ background: "#0B1428", border: `2px solid ${method.color}55`, borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
                        <div style={{ display: "flex", alignItems: "stretch", minHeight: 90 }}>
                          <div style={{ flex: 1, padding: "14px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <span style={{ background: `${method.color}22`, color: method.color, fontSize: 10, padding: "3px 8px", borderRadius: 4, fontWeight: 700, alignSelf: "flex-start", marginBottom: 8 }}>
                              {method.emoji} {method.label}
                            </span>
                            {group.items.map((ex, idx) => (
                              <div key={ex.id} style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3 }}>
                                {idx > 0 && <span style={{ color: method.color, fontSize: 11, marginRight: 4 }}>+</span>}
                                {ex.exercise}
                              </div>
                            ))}
                            <div style={{ fontSize: 10, color: "#5BB8F599", marginTop: 8 }}>▼ Ver detalle</div>
                          </div>
                          <div style={{ width: 130, background: "#0A1225", overflow: "hidden", flexShrink: 0, borderLeft: `2px solid ${method.color}55` }}>
                            {(() => { const ex = group.items[0]; return (ex.imageCustom || ex.imageUrl)
                              ? <img src={ex.imageCustom || ex.imageUrl} alt={ex.exercise} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => e.target.style.display = "none"} />
                              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🏋️</div>; })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                const ex         = group.items[0];
                const isExpanded = expandedExId === ex.id;
                return (
                  <div key={group.key} style={{ marginBottom: 10 }}>
                    <div style={{ background: "#0B1428", border: `1px solid ${isExpanded ? "#5BB8F566" : "#0A1225"}`, borderRadius: 10, overflow: "hidden", transition: "border 0.2s" }}>
                      <div onClick={() => setSelectedExGroup(group)}
                        style={{ display: "flex", alignItems: "stretch", cursor: "pointer", minHeight: 90 }}>
                        <div style={{ flex: 1, padding: "14px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                          <div style={{ fontWeight: 800, fontSize: 16 }}>{ex.exercise}</div>
                          {ex.method && METHODS[ex.method] && (
                            <span style={{ background: `${METHODS[ex.method].color}22`, color: METHODS[ex.method].color, fontSize: 10, padding: "3px 8px", borderRadius: 4, fontWeight: 700, marginTop: 6, alignSelf: "flex-start" }}>
                              {METHODS[ex.method].emoji} {METHODS[ex.method].label}
                            </span>
                          )}
                          <div style={{ fontSize: 11, color: "#6B91BB", marginTop: 6 }}>
                            {ex.type === "cardio" ? `${ex.duration} min 🕐` : `${ex.sets} series · ${ex.method === "restpause" ? `${ex.repsMain ?? ex.reps} + ${ex.repsPause ?? 2}` : ex.reps} reps`}
                          </div>
                          <div style={{ fontSize: 10, color: "#5BB8F599", marginTop: 6 }}>▼ Ver detalle</div>
                        </div>
                        <div style={{ width: 130, background: "#0A1225", overflow: "hidden", flexShrink: 0 }}>
                          {(ex.imageCustom || ex.imageUrl)
                            ? <img src={ex.imageCustom || ex.imageUrl} alt={ex.exercise} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => e.target.style.display = "none"} />
                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🏋️</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          );
        })()}

        {/* BILLING TAB */}
        {activeTab === "billing" && (
          <>
            {!billing && !hasPayments ? (
              <div style={{ ...S.card, cursor: "default", textAlign: "center", color: "#6B91BB", padding: 32 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
                Tu entrenador aún no configuró tu plan.
              </div>
            ) : student.studentType === "asesorado" ? (
              (() => {
                const plan = billing;
                const startDate   = plan?.startDate ? new Date(plan.startDate) : myPayments[0]?.date ? new Date(myPayments[0].date) : new Date();
                const totalMonths = plan?.months || (myPayments[0]?.months) || 1;
                const endDate     = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + totalMonths);
                const today2    = new Date();
                const totalDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
                const daysLeft  = Math.max(0, Math.round((endDate - today2) / (1000 * 60 * 60 * 24)));
                const daysUsed  = Math.max(0, totalDays - daysLeft);
                const pct       = Math.min(100, Math.round((daysUsed / totalDays) * 100));
                const isExpired = today2 > endDate;
                const accentColor = isExpired ? "#ff5555" : daysLeft <= 7 ? "#fbbf24" : "#A8FFD8";
                return (
                  <>
                    <div style={{ ...S.card, cursor: "default", border: `1px solid ${accentColor}44` }}>
                      <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 12 }}>MI ASESORÍA</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div>
                          <div style={{ fontSize: 48, fontWeight: 900, color: accentColor, lineHeight: 1 }}>{daysLeft}</div>
                          <div style={{ fontSize: 13, color: "#8AAFD4", marginTop: 4 }}>días restantes</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, color: "#6B91BB" }}>Inicio</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#B8D4F0" }}>{startDate.toLocaleDateString("es", { day: "numeric", month: "short" })}</div>
                          <div style={{ fontSize: 12, color: "#6B91BB", marginTop: 6 }}>Vence</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: accentColor }}>{endDate.toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}</div>
                        </div>
                      </div>
                      <div style={{ height: 8, background: "#0A1225", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: accentColor, borderRadius: 4, transition: "width 0.6s" }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#527BA8" }}>{daysUsed} de {totalDays} días transcurridos</div>
                    </div>
                    <div style={{ ...S.card, cursor: "default" }}>
                      <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 10 }}>DETALLE DEL PLAN</div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 12, color: "#8AAFD4" }}>Duración</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "#B8D4F0" }}>{totalMonths} mes{totalMonths > 1 ? "es" : ""}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, color: "#8AAFD4" }}>Valor pagado</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "#A8FFD8" }}>${myPayments.reduce((a, p) => a + p.amount, 0).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    {myPayments.length > 0 && (
                      <>
                        <div style={S.sectionTitle}>HISTORIAL DE PAGOS</div>
                        {[...myPayments].reverse().map(p => (
                          <div key={p.id} style={S.exRow}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{p.note || "Pago"}</div>
                              <div style={{ fontSize: 11, color: "#6B91BB" }}>{p.date}</div>
                            </div>
                            <span style={S.accentBadge}>${p.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                );
              })()
            ) : (
              <>
                {billStatus && (
                  <div style={{ ...S.card, cursor: "default", border: `1px solid ${billStatus.color}44` }}>
                    <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 10 }}>ESTADO DE CLASES</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: billStatus.color }}>{billStatus.label}</div>
                        <div style={{ fontSize: 12, color: "#6B91BB", marginTop: 4 }}>{billStatus.totalDone} clases tomadas · {billStatus.totalPaid} pagas</div>
                      </div>
                      <div style={{ fontSize: 36 }}>
                        {billStatus.status === "al_dia" ? "✅" : billStatus.status === "por_vencer" ? "⚠️" : "🔴"}
                      </div>
                    </div>
                    <div style={{ height: 8, background: "#0A1225", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min((billStatus.totalDone / Math.max(billStatus.totalPaid, 1)) * 100, 100)}%`, background: billStatus.color, borderRadius: 4, transition: "width 0.6s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#527BA8", marginTop: 6 }}>{billStatus.totalDone} / {billStatus.totalPaid} clases usadas</div>
                  </div>
                )}
                {billing?.classesPerMonth && (
                  <div style={{ ...S.card, cursor: "default" }}>
                    <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 10 }}>MI PLAN</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 12, color: "#8AAFD4" }}>Clases al mes</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: "#5BB8F5" }}>{billing.classesPerMonth}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, color: "#8AAFD4" }}>Valor mensual</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#B8D4F0" }}>${billing.amount?.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}
                {myClasses.length > 0 && (
                  <>
                    <div style={S.sectionTitle}>MIS CLASES TOMADAS</div>
                    <div style={{ ...S.card, cursor: "default" }}>
                      <div style={{ fontSize: 12, color: "#6B91BB", marginBottom: 10 }}>{myClasses.length} clase{myClasses.length !== 1 ? "s" : ""} registrada{myClasses.length !== 1 ? "s" : ""}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 220, overflowY: "auto" }}>
                        {[...myClasses].reverse().map((c, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #132540" }}>
                            <span style={{ fontSize: 12, color: "#5BB8F5", fontWeight: 700 }}>#{myClasses.length - i}</span>
                            <span style={{ fontSize: 12, color: "#8AAFD4" }}>📅 {c.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {myPayments.length > 0 && (
                  <>
                    <div style={S.sectionTitle}>HISTORIAL DE PAGOS</div>
                    {[...myPayments].reverse().map(p => (
                      <div key={p.id} style={S.exRow}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{p.note || "Pago"}</div>
                          <div style={{ fontSize: 11, color: "#6B91BB" }}>{p.date} · {p.classesCount} clases</div>
                        </div>
                        <span style={S.accentBadge}>${p.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* AI TAB */}
        {activeTab === "ai" && (
          <>
            <div style={{ ...S.card, cursor: "default", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Plan personalizado con IA</div>
              <div style={{ fontSize: 13, color: "#7AA0C8", marginBottom: 16 }}>Analizo tu BMI, composición corporal y objetivo para darte recomendaciones reales.</div>
              <button style={S.btn} onClick={fetchAIPlan} disabled={aiLoading}>{aiLoading ? "Generando plan..." : "Generar mi plan"}</button>
            </div>
            {(aiLoading || aiPlan) && (
              <div style={S.aiBox}>
                <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, marginBottom: 10 }}>TU PLAN PERSONALIZADO</div>
                {aiLoading
                  ? <div style={{ color: "#6B91BB", fontSize: 14 }}>⏳ Analizando tus datos...</div>
                  : <div style={{ fontSize: 13, lineHeight: 1.8, color: "#ddd", whiteSpace: "pre-wrap" }}>{aiPlan}</div>}
              </div>
            )}
          </>
        )}
      </div>

      {!isPreview && (
        <div style={{ display: "flex", justifyContent: "center", padding: "24px 0 32px" }}>
          <button style={{ ...S.btnDanger, fontSize: 13, padding: "10px 40px" }} onClick={onLogout}>Salir</button>
        </div>
      )}
    </div>
  );
}
