const express = require("express");
const router = express.Router();
const db = require("../db/database");

// GET payments for student
router.get("/:studentId", (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const row = db.prepare("SELECT data FROM payments WHERE student_id = ?").get(studentId);
    res.json(row ? JSON.parse(row.data) : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add payment for student
router.post("/:studentId", (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const payment = req.body;
    const row = db.prepare("SELECT data FROM payments WHERE student_id = ?").get(studentId);
    const payments = row ? JSON.parse(row.data) : [];
    payments.push(payment);
    db.prepare("INSERT OR REPLACE INTO payments (student_id, data) VALUES (?, ?)").run(studentId, JSON.stringify(payments));
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT full replacement
router.put("/:studentId", (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const payments = req.body;
    db.prepare("INSERT OR REPLACE INTO payments (student_id, data) VALUES (?, ?)").run(studentId, JSON.stringify(payments));
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE payment
router.delete("/:studentId/:paymentId", (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const paymentId = parseInt(req.params.paymentId);
    const row = db.prepare("SELECT data FROM payments WHERE student_id = ?").get(studentId);
    const payments = row ? JSON.parse(row.data) : [];
    const updated = payments.filter(p => p.id !== paymentId);
    db.prepare("INSERT OR REPLACE INTO payments (student_id, data) VALUES (?, ?)").run(studentId, JSON.stringify(updated));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
