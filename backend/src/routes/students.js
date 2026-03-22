const express = require("express");
const router = express.Router();
const { pool } = require("../db/database");

// GET all students
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT data FROM students ORDER BY id");
    res.json(result.rows.map(r => r.data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add student
router.post("/", async (req, res) => {
  try {
    const student = req.body;
    await pool.query(
      "INSERT INTO students (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data",
      [student.id, student]
    );
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update student
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const student = req.body;
    await pool.query(
      "INSERT INTO students (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data",
      [id, student]
    );
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE student
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query("DELETE FROM students WHERE id = $1", [id]);
    await pool.query("DELETE FROM routines WHERE student_id = $1", [id]);
    await pool.query("DELETE FROM payments WHERE student_id = $1", [id]);
    await pool.query("DELETE FROM classes WHERE student_id = $1", [id]);
    await pool.query("DELETE FROM weight_log WHERE student_id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
