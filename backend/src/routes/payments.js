const express = require("express");
const router = express.Router();
const { pool } = require("../db/database");

// GET payments for student
router.get("/:studentId", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const result = await pool.query("SELECT data FROM payments WHERE student_id = $1", [studentId]);
    res.json(result.rows[0] ? result.rows[0].data : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add payment for student
router.post("/:studentId", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const payment = req.body;
    const result = await pool.query("SELECT data FROM payments WHERE student_id = $1", [studentId]);
    const payments = result.rows[0] ? result.rows[0].data : [];
    payments.push(payment);
    await pool.query(
      "INSERT INTO payments (student_id, data) VALUES ($1, $2) ON CONFLICT (student_id) DO UPDATE SET data = EXCLUDED.data",
      [studentId, JSON.stringify(payments)]
    );
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT full replacement
router.put("/:studentId", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const payments = req.body;
    await pool.query(
      "INSERT INTO payments (student_id, data) VALUES ($1, $2) ON CONFLICT (student_id) DO UPDATE SET data = EXCLUDED.data",
      [studentId, JSON.stringify(payments)]
    );
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE payment
router.delete("/:studentId/:paymentId", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const paymentId = parseInt(req.params.paymentId);
    const result = await pool.query("SELECT data FROM payments WHERE student_id = $1", [studentId]);
    const payments = result.rows[0] ? result.rows[0].data : [];
    const updated = payments.filter(p => p.id !== paymentId);
    await pool.query(
      "INSERT INTO payments (student_id, data) VALUES ($1, $2) ON CONFLICT (student_id) DO UPDATE SET data = EXCLUDED.data",
      [studentId, JSON.stringify(updated)]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
