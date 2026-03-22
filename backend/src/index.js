console.log("== CR BODYLAB BACKEND STARTING ==");
console.log("Node version:", process.version);
console.log("PORT env:", process.env.PORT);
console.log("DATABASE_URL set:", !!process.env.DATABASE_URL);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initDB } = require("./db/database");

const studentsRouter = require("./routes/students");
const routinesRouter = require("./routes/routines");
const paymentsRouter = require("./routes/payments");
const classesRouter = require("./routes/classes");
const weightLogRouter = require("./routes/weightLog");
const libraryRouter = require("./routes/library");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/students", studentsRouter);
app.use("/api/routines", routinesRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/classes", classesRouter);
app.use("/api/weight-log", weightLogRouter);
app.use("/api/library", libraryRouter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ── Proxy IA → Anthropic ──────────────────────────────────────────────────────
app.post("/api/ai", async (req, res) => {
  const { prompt, system, max_tokens = 2000 } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "tu_api_key_aqui") {
    return res.status(503).json({ error: "Falta configurar ANTHROPIC_API_KEY en backend/.env" });
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens,
        ...(system ? { system } : {}),
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start HTTP server immediately so Railway health checks pass
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

// Connect to DB after server is up, with retries
async function connectWithRetry(retries = 10, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await initDB();
      console.log("Database connected and ready.");
      return;
    } catch (err) {
      console.error(`DB connection attempt ${i}/${retries} failed:`, err.message);
      if (i < retries) await new Promise(r => setTimeout(r, delay));
    }
  }
  console.error("Could not connect to database after all retries.");
}

connectWithRetry();
