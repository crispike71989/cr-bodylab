const express = require("express");
const router = express.Router();
const db = require("../db/database");

// GET weight log for student
router.get("/:studentId", (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const row = db.prepare("SELECT data FROM weight_log WHERE student_id = ?").get(studentId);
    res.json(row ? JSON.parse(row.data) : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add weight entry for student
router.post("/:studentId", (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const entry = req.body;
    const row = db.prepare("SELECT data FROM weight_log WHERE student_id = ?").get(studentId);
    const log = row ? JSON.parse(row.data) : [];
    log.push(entry);
    log.sort((a, b) => a.date.localeCompare(b.date));
    db.prepare("INSERT OR REPLACE INTO weight_log (student_id, data) VALUES (?, ?)").run(studentId, JSON.stringify(log));
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update entire weight log
router.put("/:studentId", (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const log = req.body;
    db.prepare("INSERT OR REPLACE INTO weight_log (student_id, data) VALUES (?, ?)").run(studentId, JSON.stringify(log));
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update single entry
router.put("/:studentId/:entryIndex", (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const entryIndex = parseInt(req.params.entryIndex);
    const updatedEntry = req.body;
    const row = db.prepare("SELECT data FROM weight_log WHERE student_id = ?").get(studentId);
    let log = row ? JSON.parse(row.data) : [];
    log[entryIndex] = updatedEntry;
    log.sort((a, b) => a.date.localeCompare(b.date));
    db.prepare("INSERT OR REPLACE INTO weight_log (student_id, data) VALUES (?, ?)").run(studentId, JSON.stringify(log));
    res.json(updatedEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE weight entry
router.delete("/:studentId/:entryIndex", (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const entryIndex = parseInt(req.params.entryIndex);
    const row = db.prepare("SELECT data FROM weight_log WHERE student_id = ?").get(studentId);
    let log = row ? JSON.parse(row.data) : [];
    log = log.filter((_, i) => i !== entryIndex);
    db.prepare("INSERT OR REPLACE INTO weight_log (student_id, data) VALUES (?, ?)").run(studentId, JSON.stringify(log));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
