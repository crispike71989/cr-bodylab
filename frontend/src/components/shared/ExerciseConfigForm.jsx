import { S, METHODS } from "../../App.jsx";

export default function ExerciseConfigForm({ ex, setEx, studentRoutine }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[["SERIES", "sets"], ["REPS", "reps"], ["KG", "weight"]].map(([label, key]) => (
          <div key={key}>
            <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 4 }}>{label}</div>
            <input
              style={{ background: "#0B1428", border: "1px solid #2a2a2a", color: "#5BB8F5", padding: "9px 10px", borderRadius: 8, fontSize: 14, width: "100%", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }}
              type="number" value={ex[key]} onChange={e => setEx(p => ({ ...p, [key]: Number(e.target.value) }))} />
          </div>
        ))}
      </div>

      <div>
        <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 6 }}>FOTO (URL)</div>
        <input
          style={{ background: "#0B1428", border: "1px solid #2a2a2a", color: "#5BB8F5", padding: "9px 10px", borderRadius: 8, fontSize: 12, width: "100%", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }}
          placeholder="https://..." value={ex.imageUrl || ""} onChange={e => setEx(p => ({ ...p, imageUrl: e.target.value }))} />
        {ex.imageUrl && (
          <img src={ex.imageUrl} alt="preview" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginTop: 8 }}
            onError={e => e.target.style.display = "none"} />
        )}
      </div>

      <div>
        <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 6 }}>MÉTODO</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <button onClick={() => setEx(p => ({ ...p, method: null, methodGroup: null, tempo: null, drops: null }))}
            style={{ background: !ex.method ? "#5BB8F5" : "#0B1428", color: !ex.method ? "#070C18" : "#7AA0C8", border: "1px solid #2a2a2a", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
            Ninguno
          </button>
          {Object.entries(METHODS).map(([key, m]) => (
            <button key={key} onClick={() => setEx(p => ({ ...p, method: key, methodGroup: null, tempo: null, drops: null }))}
              style={{ background: ex.method === key ? `${m.color}33` : "#0B1428", border: `1px solid ${ex.method === key ? m.color : "#0F1C35"}`, color: ex.method === key ? m.color : "#7AA0C8", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {ex.method && (
        <div style={{ background: "#070C18", border: `1px solid ${METHODS[ex.method].color}55`, borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 12, color: METHODS[ex.method].color, marginBottom: 8, fontWeight: 600 }}>{METHODS[ex.method].desc}</div>
          {(ex.method === "biserie" || ex.method === "triserie") && (
            <div style={{ fontSize: 11, color: "#6B91BB", padding: "6px 0" }}>Los ejercicios se agrupan automáticamente.</div>
          )}
          {ex.method === "restpause" && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: "#6B91BB", marginBottom: 6 }}>REPS REST & PAUSE (Principal + Pausa)</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "#6B91BB", marginBottom: 4 }}>Reps principales</div>
                  <input type="number" value={ex.repsMain ?? ex.reps ?? 10} onChange={e => setEx(p => ({ ...p, repsMain: +e.target.value }))}
                    style={{ ...S.input, textAlign: "center" }} min={1} />
                </div>
                <div style={{ fontSize: 18, color: "#e879f9", paddingTop: 18 }}>+</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "#6B91BB", marginBottom: 4 }}>Reps pausa</div>
                  <input type="number" value={ex.repsPause ?? 2} onChange={e => setEx(p => ({ ...p, repsPause: +e.target.value }))}
                    style={{ ...S.input, textAlign: "center" }} min={1} />
                </div>
              </div>
            </div>
          )}
          {ex.method === "dropset" && (
            <div>
              <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 6 }}>CANTIDAD DE DROPS</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[2, 3, 4].map(n => (
                  <button key={n} onClick={() => setEx(p => ({ ...p, drops: n }))}
                    style={{ background: ex.drops === n ? "#5BB8F5" : "#0B1428", color: ex.drops === n ? "#070C18" : "#B8D4F0", border: "1px solid #2a2a2a", padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{n}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
