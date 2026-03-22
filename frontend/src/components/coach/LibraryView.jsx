import { useState } from "react";
import { S, METHODS } from "../../App.jsx";

export default function LibraryView({ myLibrary, setMyLibrary }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filter, setFilter] = useState("");
  const emptyForm = { name: "", muscle: "", method: null, tempo: null, drops: null, methodGroup: null, notes: "", imageUrl: "" };
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setForm(emptyForm); setEditItem(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setShowForm(true); };

  const save = () => {
    if (!form.name) return;
    if (editItem) {
      setMyLibrary(prev => prev.map(e => e.id === editItem.id ? { ...form, id: editItem.id } : e));
    } else {
      setMyLibrary(prev => [...prev, { ...form, id: Date.now() }]);
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditItem(null);
  };

  const remove = (id) => setMyLibrary(prev => prev.filter(e => e.id !== id));

  const filtered = myLibrary.filter(e =>
    e.name.toLowerCase().includes(filter.toLowerCase()) ||
    (e.muscle || "").toLowerCase().includes(filter.toLowerCase())
  );

  const muscles = ["Piernas", "Glúteos", "Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", "Core", "Cardio", "Otro"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Mi Biblioteca</div>
          <div style={{ fontSize: 12, color: "#6B91BB", marginTop: 2 }}>{myLibrary.length} ejercicio{myLibrary.length !== 1 ? "s" : ""} guardado{myLibrary.length !== 1 ? "s" : ""}</div>
        </div>
        <button style={S.btn} onClick={openAdd}>+ Nuevo</button>
      </div>

      <input style={{ ...S.input, marginBottom: 14 }} placeholder="🔍 Buscar ejercicio o músculo..." value={filter} onChange={e => setFilter(e.target.value)} />

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", color: "#527BA8", padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📚</div>
          <div>Tu biblioteca está vacía.</div>
          <div style={{ fontSize: 12, marginTop: 6, color: "#456E9E" }}>Agregá ejercicios con foto, músculo y método.</div>
        </div>
      )}

      {filtered.map(item => {
        const method = item.method ? METHODS[item.method] : null;
        return (
          <div key={item.id} style={{ ...S.card, cursor: "default" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{item.name}</div>
                {item.muscle && <div style={{ fontSize: 11, color: "#6B91BB", marginTop: 2 }}>💪 {item.muscle}</div>}
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  {method && (
                    <span style={{ background: `${method.color}22`, color: method.color, fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                      {method.emoji} {method.label}
                    </span>
                  )}
                  {item.method === "dropset" && item.drops && (
                    <span style={{ background: "#fb923c22", color: "#fb923c", fontSize: 10, padding: "2px 8px", borderRadius: 4 }}>📉 {item.drops} drops</span>
                  )}
                </div>
                {item.notes && <div style={{ fontSize: 11, color: "#527BA8", marginTop: 6, fontStyle: "italic" }}>"{item.notes}"</div>}
              </div>
              <div style={{ width: 200, minHeight: 160, borderRadius: 10, background: "#0A1225", overflow: "hidden", flexShrink: 0, alignSelf: "stretch" }}>
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => e.target.style.display = "none"} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🏋️</div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button onClick={() => openEdit(item)} style={{ background: "#0A1225", border: "none", color: "#B8D4F0", cursor: "pointer", borderRadius: 6, padding: "5px 8px", fontSize: 12 }}>✏️</button>
                <button onClick={() => remove(item.id)} style={{ background: "none", border: "none", color: "#456E9E", cursor: "pointer", fontSize: 16, padding: "5px 4px" }}>✕</button>
              </div>
            </div>
          </div>
        );
      })}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "#0B1428", border: "1px solid #2a2a2a", borderRadius: "16px 16px 0 0", padding: 22, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#5BB8F5" }}>{editItem ? "Editar ejercicio" : "Nuevo ejercicio"}</div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#6B91BB", cursor: "pointer", fontSize: 22 }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={S.sectionTitle}>NOMBRE</div>
                <input style={S.input} placeholder="ej: Sentadilla búlgara" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>

              <div>
                <div style={S.sectionTitle}>GRUPO MUSCULAR</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {muscles.map(m => (
                    <button key={m} onClick={() => setForm(p => ({ ...p, muscle: p.muscle === m ? "" : m }))}
                      style={{ background: form.muscle === m ? "#5BB8F5" : "#0B1428", color: form.muscle === m ? "#000" : "#7AA0C8", border: "1px solid #2a2a2a", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={S.sectionTitle}>FOTO (URL)</div>
                <input style={S.input} placeholder="https://..." value={form.imageUrl || ""} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview" style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 8, marginTop: 8 }}
                    onError={e => e.target.style.display = "none"} />
                )}
              </div>

              <div>
                <div style={S.sectionTitle}>MÉTODO</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => setForm(p => ({ ...p, method: null, tempo: null, drops: null }))}
                    style={{ background: !form.method ? "#5BB8F5" : "#0B1428", color: !form.method ? "#000" : "#7AA0C8", border: "1px solid #2a2a2a", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                    Ninguno
                  </button>
                  {Object.entries(METHODS).map(([key, m]) => (
                    <button key={key} onClick={() => setForm(p => ({ ...p, method: key, tempo: null, drops: null }))}
                      style={{ background: form.method === key ? `${m.color}33` : "#0B1428", border: `1px solid ${form.method === key ? m.color : "#0F1C35"}`, color: form.method === key ? m.color : "#7AA0C8", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                      {m.emoji} {m.label}
                    </button>
                  ))}
                </div>

                {form.method === "dropset" && (
                  <div style={{ marginTop: 10 }}>
                    <div style={S.sectionTitle}>CANTIDAD DE DROPS</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[2, 3, 4].map(n => (
                        <button key={n} onClick={() => setForm(p => ({ ...p, drops: n }))}
                          style={{ background: form.drops === n ? "#5BB8F5" : "#0B1428", color: form.drops === n ? "#000" : "#B8D4F0", border: "1px solid #2a2a2a", padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{n}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div style={S.sectionTitle}>NOTA / INDICACIÓN</div>
                <input style={S.input} placeholder="ej: Rodillas alineadas con pies..." value={form.notes || ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>

              <button style={{ ...S.btn, width: "100%", marginTop: 4 }} onClick={save}>
                {editItem ? "Guardar cambios" : "Agregar a mi biblioteca"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
