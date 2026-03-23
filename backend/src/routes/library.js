const express = require("express");
const router = express.Router();
const db = require("../db/database");

// GET library
router.get("/", (req, res) => {
  try {
    const row = db.prepare("SELECT data FROM library WHERE id = 1").get();
    res.json(row ? JSON.parse(row.data) : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update library
router.put("/", (req, res) => {
  try {
    const library = req.body;
    db.prepare("INSERT OR REPLACE INTO library (id, data) VALUES (1, ?)").run(JSON.stringify(library));
    res.json(library);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
