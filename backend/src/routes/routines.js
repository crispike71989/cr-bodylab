const express = require("express");
const router = express.Router();
const db = require("../db/database");

// GET routines for student
router.get("/:studentId", (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const row = db.prepare("SELECT data FROM routines WHERE student_id = ?").get(studentId);
    res.json(row ? JSON.parse(row.data) : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update routines for student
router.put("/:studentId", (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const routines = req.body;
    db.prepare("INSERT OR REPLACE INTO routines (student_id, data) VALUES (?, ?)").run(studentId, JSON.stringify(routines));
    res.json(routines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
