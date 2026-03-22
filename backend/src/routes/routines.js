const express = require("express");
const router = express.Router();
const { pool } = require("../db/database");

// GET routines for student
router.get("/:studentId", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const result = await pool.query("SELECT data FROM routines WHERE student_id = $1", [studentId]);
    res.json(result.rows[0] ? result.rows[0].data : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update routines for student
router.put("/:studentId", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const routines = req.body;
    await pool.query(
      "INSERT INTO routines (student_id, data) VALUES ($1, $2) ON CONFLICT (student_id) DO UPDATE SET data = EXCLUDED.data",
      [studentId, JSON.stringify(routines)]
    );
    res.json(routines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
