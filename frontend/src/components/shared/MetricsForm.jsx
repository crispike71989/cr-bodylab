import { useState } from "react";
import { S, GLOBAL_STYLE } from "../../App.jsx";
import { calcBMI, bmiCategory } from "../../utils/metrics.js";

export default function MetricsForm({ student, onSave, onCancel, isOnboarding = false }) {
  const [goal, setGoal] = useState(student.goal || null);
  const [trainingDays, setTrainingDays] = useState(student.trainingDays || null);
  const [dayNames, setDayNames] = useState(student.dayNames || []);
  const [form, setForm] = useState({
    weight:    student.metrics?.weight    || "",
    height:    student.metrics?.height    || "",
    fatPct:    student.metrics?.fatPct    || "",
    musclePct: student.metrics?.musclePct || "",
    waterPct:  student.metrics?.waterPct  || "",
  });
  const [step, setStep] = useState(isOnboarding ? "goal" : "metrics");

  const bmi = form.weight && form.height ? calcBMI(Number(form.weight), Number(form.height)) : null;

  const handleSave = () => {
    if (!goal || !form.weight || !form.height) return;
    onSave({
      goal,
      trainingDays,
      dayNames,
      metrics: {
        ...form,
        weight:    Number(form.weight),
        height:    Number(form.height),
        bmi:       Number(bmi),
        fatPct:    Number(form.fatPct),
        musclePct: Number(form.musclePct),
        waterPct:  Number(form.waterPct),
      },
    });
  };

  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const DAY_SUGGESTIONS = ["Piernas","Pecho","Espalda","Hombros","Bíceps y tríceps","Espalda y bíceps","Pecho y tríceps","Hombros y brazos","Full body","Cardio","Glúteos","Tren superior","Tren inferior"];

  const wrapStyle = { minHeight: "100vh", background: "#0A0F1E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Barlow', sans-serif" };

  // STEP 1: Objetivo
  if (step === "goal") return (
    <div style={wrapStyle}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#5BB8F5", marginBottom: 8 }}>¡Hola, {student.firstName}! 👋</div>
        <div style={{ fontSize: 14, color: "#7AA0C8" }}>¿Cuál es tu objetivo principal?</div>
      </div>
      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          { key: "perdida", emoji: "🔥", title: "Pérdida de peso",    desc: "Quemo grasa y mejoro mi composición corporal",       color: "#FF9E80" },
          { key: "musculo", emoji: "💪", title: "Ganancia muscular",  desc: "Aumento masa muscular y me pongo más fuerte",         color: "#A8FFD8" },
        ].map((opt) => (
          <div key={opt.key} onClick={() => setGoal(opt.key)}
            style={{ background: goal === opt.key ? `${opt.color}18` : "#0B1428", border: `2px solid ${goal === opt.key ? opt.color : "#0A1225"}`, borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{opt.emoji}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: goal === opt.key ? opt.color : "#5BB8F5", marginBottom: 4 }}>{opt.title}</div>
            <div style={{ fontSize: 13, color: "#7AA0C8" }}>{opt.desc}</div>
          </div>
        ))}
        <button style={{ ...S.btn, width: "100%", marginTop: 8, opacity: goal ? 1 : 0.4 }} onClick={() => goal && setStep("days")}>Continuar →</button>
        {onCancel && <button style={{ ...S.btnSecondary, width: "100%", textAlign: "center" }} onClick={onCancel}>Cancelar</button>}
      </div>
    </div>
  );

  // STEP 2: Días de entrenamiento
  if (step === "days") return (
    <div style={wrapStyle}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#5BB8F5", marginBottom: 8 }}>¿Cuántos días entrenás por semana? 📅</div>
        <div style={{ fontSize: 13, color: "#7AA0C8" }}>Contá todos los días, incluso los que venís solo.</div>
      </div>
      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
          {[1,2,3,4,5,6,7].map(n => (
            <div key={n} onClick={() => { setTrainingDays(n); setDayNames(Array(n).fill("").map((_, i) => dayNames[i] || "")); }}
              style={{ background: trainingDays === n ? "#5BB8F5" : "#0B1428", border: `2px solid ${trainingDays === n ? "#5BB8F5" : "#0A1225"}`, borderRadius: 12, padding: "18px 0", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: trainingDays === n ? "#070C18" : "#5BB8F5" }}>{n}</div>
              <div style={{ fontSize: 10, color: trainingDays === n ? "#456E9E" : "#6B91BB", marginTop: 2 }}>{n === 1 ? "día" : "días"}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button style={{ ...S.btnSecondary, flex: 1 }} onClick={() => setStep("goal")}>← Volver</button>
          <button style={{ ...S.btn, flex: 2, opacity: trainingDays ? 1 : 0.4 }} onClick={() => trainingDays && setStep("daynames")}>Continuar →</button>
        </div>
        {onCancel && <button style={{ ...S.btnSecondary, width: "100%", textAlign: "center" }} onClick={onCancel}>Cancelar</button>}
      </div>
    </div>
  );

  // STEP 3: Nombre de cada día
  if (step === "daynames") return (
    <div style={{ ...wrapStyle, justifyContent: "flex-start", paddingTop: 40 }}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ textAlign: "center", marginBottom: 28, width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#5BB8F5", marginBottom: 6 }}>Poné nombre a cada día 🏷️</div>
        <div style={{ fontSize: 13, color: "#7AA0C8" }}>Podés escribirlo vos o elegir una sugerencia.</div>
      </div>
      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 14 }}>
        {Array.from({ length: trainingDays }).map((_, i) => (
          <div key={i} style={{ background: "#0B1428", border: "1px solid #252525", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: "#5BB8F5", letterSpacing: 2, marginBottom: 8 }}>DÍA {i + 1}</div>
            <input style={S.input} placeholder="ej: Piernas, Pecho, Full body..."
              value={dayNames[i] || ""}
              onChange={e => setDayNames(prev => prev.map((d, j) => j === i ? e.target.value : d))} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {DAY_SUGGESTIONS.map(sug => (
                <button key={sug} onClick={() => setDayNames(prev => prev.map((d, j) => j === i ? sug : d))}
                  style={{ background: dayNames[i] === sug ? "#5BB8F5" : "#0B1428", border: `1px solid ${dayNames[i] === sug ? "#5BB8F5" : "#0F1C35"}`, color: dayNames[i] === sug ? "#070C18" : "#B8D4F0", padding: "4px 9px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                  {sug}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button style={{ ...S.btnSecondary, flex: 1 }} onClick={() => setStep("days")}>← Volver</button>
          <button style={{ ...S.btn, flex: 2 }} onClick={() => setStep("metrics")}>Continuar →</button>
        </div>
        {onCancel && <button style={{ ...S.btnSecondary, width: "100%", textAlign: "center" }} onClick={onCancel}>Cancelar</button>}
      </div>
    </div>
  );

  // STEP 4: Datos corporales
  return (
    <div style={{ ...wrapStyle, justifyContent: "flex-start", paddingTop: 40 }}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ textAlign: "center", marginBottom: 28, width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#5BB8F5", marginBottom: 6 }}>Mis datos corporales 📊</div>
        <div style={{ fontSize: 13, color: "#7AA0C8" }}>Esta info nos ayuda a personalizar tu plan</div>
      </div>
      <div style={{ width: "100%", maxWidth: 380, background: "#0B1428", border: "1px solid #252525", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div><div style={S.sectionTitle}>PESO (KG)</div><input style={S.input} type="number" placeholder="ej: 75" value={form.weight} onChange={(e) => f("weight", e.target.value)} /></div>
          <div><div style={S.sectionTitle}>ALTURA (CM)</div><input style={S.input} type="number" placeholder="ej: 175" value={form.height} onChange={(e) => f("height", e.target.value)} /></div>
        </div>
        {bmi && (() => { const cat = bmiCategory(Number(bmi)); return (
          <div style={{ background: "#0B1428", border: `1px solid ${cat.color}44`, borderRadius: 10, padding: 12, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2 }}>IMC</div><div style={{ fontSize: 22, fontWeight: 800, color: cat.color, marginTop: 2 }}>{bmi}</div></div>
            <div style={{ background: `${cat.color}22`, color: cat.color, fontSize: 12, padding: "4px 10px", borderRadius: 6, fontWeight: 700 }}>{cat.label}</div>
          </div>
        ); })()}
        <div style={S.sectionTitle}>COMPOSICIÓN CORPORAL (%)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[{ key: "fatPct", label: "GRASA", color: "#FF9E80", icon: "🔥" }, { key: "musclePct", label: "MÚSCULO", color: "#A8FFD8", icon: "💪" }, { key: "waterPct", label: "AGUA", color: "#BAD8FF", icon: "💧" }].map((m) => (
            <div key={m.key}>
              <div style={{ fontSize: 10, color: m.color, letterSpacing: 1, marginBottom: 6 }}>{m.icon} {m.label}</div>
              <input style={{ ...S.input, borderColor: form[m.key] ? `${m.color}44` : "#0F1C35" }} type="number" placeholder="%" value={form[m.key]} onChange={(e) => f(m.key, e.target.value)} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button style={{ ...S.btn, width: "100%" }} onClick={handleSave}>Guardar y continuar →</button>
          {isOnboarding && <button style={{ ...S.btnSecondary, width: "100%", textAlign: "center" }} onClick={() => setStep("daynames")}>← Volver</button>}
          {onCancel && !isOnboarding && <button style={{ ...S.btnSecondary, width: "100%", textAlign: "center" }} onClick={onCancel}>Cancelar</button>}
        </div>
      </div>
    </div>
  );
}
