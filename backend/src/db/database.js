const fs = require("fs");
const path = require("path");

// On Railway: /data is a persistent volume. Locally: project root.
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "../../");
const DB_FILE = path.join(DATA_DIR, "gym-data.json");

// ── Seed data ─────────────────────────────────────────────────────────────────
const INITIAL_DATA = {
  students: [],
  routines: {},
  payments: {},
  classes: {},
  weight_log: {},
  library: [],
};

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch (e) {
    return { ...INITIAL_DATA };
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ── SQL-like shim ─────────────────────────────────────────────────────────────
class Statement {
  constructor(sql) { this.sql = sql; }

  all() {
    const db = loadDB();
    const table = this._table();
    if (!table) return [];
    const rows = db[table];
    if (Array.isArray(rows)) return rows.map(item => ({ data: JSON.stringify(item) }));
    return Object.values(rows).map(item => ({ data: JSON.stringify(item) }));
  }

  get(...params) {
    const db = loadDB();
    const table = this._table();
    const id = params[0];
    if (table === "library") return db.library.length > 0 ? { data: JSON.stringify(db.library) } : null;
    if (table === "students") {
      const s = db.students.find(s => s.id === id);
      return s ? { data: JSON.stringify(s) } : null;
    }
    const col = this._keyCol();
    const row = db[table] && db[table][id] !== undefined ? { data: JSON.stringify(db[table][id]) } : null;
    return row;
  }

  run(...params) {
    const db = loadDB();
    const sql = this.sql.trim().toUpperCase();
    const table = this._table();

    if (sql.startsWith("DELETE")) {
      const id = params[0];
      if (table === "students") db.students = db.students.filter(s => s.id !== id);
      else if (db[table]) delete db[table][id];
    } else if (sql.startsWith("INSERT") || sql.startsWith("REPLACE")) {
      if (table === "library") {
        db.library = JSON.parse(params[0] !== undefined ? params[0] : params[params.length - 1]);
      } else if (table === "students") {
        const item = JSON.parse(params[1] !== undefined ? params[1] : params[0]);
        const idx = db.students.findIndex(s => s.id === item.id);
        if (idx >= 0) db.students[idx] = item;
        else db.students.push(item);
      } else {
        const key = params[0];
        const val = params[1] !== undefined ? params[1] : params[0];
        if (!db[table]) db[table] = {};
        db[table][key] = JSON.parse(val);
      }
    }
    saveDB(db);
  }

  _table() {
    const m = this.sql.match(/(?:FROM|INTO|UPDATE|TABLE)\s+(\w+)/i);
    return m ? m[1].toLowerCase() : null;
  }

  _keyCol() {
    if (this.sql.includes("student_id")) return "student_id";
    return "id";
  }
}

const db = {
  prepare: (sql) => new Statement(sql),
  exec: () => {},
  pragma: () => {},
  transaction: (fn) => fn,
};

module.exports = db;
