const express = require("express");
const router = express.Router();
const { pool } = require("../db/database");

// GET weight log for student
router.get("/:studentId", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const result = await pool.query("SELECT data FROM weight_log WHERE student_id = $1", [studentId]);
    res.json(result.rows[0] ? result.rows[0].data : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add weight entry for student
router.post("/:studentId", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const entry = req.body;
    const result = await pool.query("SELECT data FROM weight_log WHERE student_id = $1", [studentId]);
    const log = result.rows[0] ? result.rows[0].data : [];
    log.push(entry);
    log.sort((a, b) => a.date.localeCompare(b.date));
    await pool.query(
      "INSERT INTO weight_log (student_id, data) VALUES ($1, $2) ON CONFLICT (student_id) DO UPDATE SET data = EXCLUDED.data",
      [studentId, JSON.stringify(log)]
    );
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update entire weight log
router.put("/:studentId", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const log = req.body;
    await pool.query(
      "INSERT INTO weight_log (student_id, data) VALUES ($1, $2) ON CONFLICT (student_id) DO UPDATE SET data = EXCLUDED.data",
      [studentId, JSON.stringify(log)]
    );
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update single entry
router.put("/:studentId/:entryIndex", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const entryIndex = parseInt(req.params.entryIndex);
    const updatedEntry = req.body;
    const result = await pool.query("SELECT data FROM weight_log WHERE student_id = $1", [studentId]);
    const log = result.rows[0] ? result.rows[0].data : [];
    log[entryIndex] = updatedEntry;
    log.sort((a, b) => a.date.localeCompare(b.date));
    await pool.query(
      "INSERT INTO weight_log (student_id, data) VALUES ($1, $2) ON CONFLICT (student_id) DO UPDATE SET data = EXCLUDED.data",
      [studentId, JSON.stringify(log)]
    );
    res.json(updatedEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE weight entry
router.delete("/:studentId/:entryIndex", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const entryIndex = parseInt(req.params.entryIndex);
    const result = await pool.query("SELECT data FROM weight_log WHERE student_id = $1", [studentId]);
    let log = result.rows[0] ? result.rows[0].data : [];
    log = log.filter((_, i) => i !== entryIndex);
    await pool.query(
      "INSERT INTO weight_log (student_id, data) VALUES ($1, $2) ON CONFLICT (student_id) DO UPDATE SET data = EXCLUDED.data",
      [studentId, JSON.stringify(log)]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
