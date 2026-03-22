const express = require("express");
const router = express.Router();
const { pool } = require("../db/database");

// GET classes for student
router.get("/:studentId", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const result = await pool.query("SELECT data FROM classes WHERE student_id = $1", [studentId]);
    res.json(result.rows[0] ? result.rows[0].data : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add class session for student
router.post("/:studentId", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const classSession = req.body;
    const result = await pool.query("SELECT data FROM classes WHERE student_id = $1", [studentId]);
    const classes = result.rows[0] ? result.rows[0].data : [];
    classes.push(classSession);
    await pool.query(
      "INSERT INTO classes (student_id, data) VALUES ($1, $2) ON CONFLICT (student_id) DO UPDATE SET data = EXCLUDED.data",
      [studentId, JSON.stringify(classes)]
    );
    res.json(classSession);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT full replacement
router.put("/:studentId", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const classes = req.body;
    await pool.query(
      "INSERT INTO classes (student_id, data) VALUES ($1, $2) ON CONFLICT (student_id) DO UPDATE SET data = EXCLUDED.data",
      [studentId, JSON.stringify(classes)]
    );
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE class session
router.delete("/:studentId/:classId", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const classId = parseInt(req.params.classId);
    const result = await pool.query("SELECT data FROM classes WHERE student_id = $1", [studentId]);
    const classes = result.rows[0] ? result.rows[0].data : [];
    const updated = classes.filter(c => c.id !== classId);
    await pool.query(
      "INSERT INTO classes (student_id, data) VALUES ($1, $2) ON CONFLICT (student_id) DO UPDATE SET data = EXCLUDED.data",
      [studentId, JSON.stringify(updated)]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
