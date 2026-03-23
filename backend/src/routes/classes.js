const express = require("express");
const router = express.Router();
const db = require("../db/database");

// GET classes for student
router.get("/:studentId", (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const row = db.prepare("SELECT data FROM classes WHERE student_id = ?").get(studentId);
    res.json(row ? JSON.parse(row.data) : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add class session for student
router.post("/:studentId", (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const classSession = req.body;
    const row = db.prepare("SELECT data FROM classes WHERE student_id = ?").get(studentId);
    const classes = row ? JSON.parse(row.data) : [];
    classes.push(classSession);
    db.prepare("INSERT OR REPLACE INTO classes (student_id, data) VALUES (?, ?)").run(studentId, JSON.stringify(classes));
    res.json(classSession);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT full replacement
router.put("/:studentId", (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const classes = req.body;
    db.prepare("INSERT OR REPLACE INTO classes (student_id, data) VALUES (?, ?)").run(studentId, JSON.stringify(classes));
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE class session
router.delete("/:studentId/:classId", (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const classId = parseInt(req.params.classId);
    const row = db.prepare("SELECT data FROM classes WHERE student_id = ?").get(studentId);
    const classes = row ? JSON.parse(row.data) : [];
    const updated = classes.filter(c => c.id !== classId);
    db.prepare("INSERT OR REPLACE INTO classes (student_id, data) VALUES (?, ?)").run(studentId, JSON.stringify(updated));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
