const express = require("express");
const router = express.Router();
const db = require("../db/database");

// GET all students
router.get("/", (req, res) => {
  try {
    const rows = db.prepare("SELECT data FROM students ORDER BY id").all();
    const students = rows.map(r => JSON.parse(r.data));
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add student
router.post("/", (req, res) => {
  try {
    const student = req.body;
    db.prepare("INSERT INTO students (id, data) VALUES (?, ?)").run(student.id, JSON.stringify(student));
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update student
router.put("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const student = req.body;
    db.prepare("INSERT OR REPLACE INTO students (id, data) VALUES (?, ?)").run(id, JSON.stringify(student));
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE student
router.delete("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    db.prepare("DELETE FROM students WHERE id = ?").run(id);
    db.prepare("DELETE FROM routines WHERE student_id = ?").run(id);
    db.prepare("DELETE FROM payments WHERE student_id = ?").run(id);
    db.prepare("DELETE FROM classes WHERE student_id = ?").run(id);
    db.prepare("DELETE FROM weight_log WHERE student_id = ?").run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
