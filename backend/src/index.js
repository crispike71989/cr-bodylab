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

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
