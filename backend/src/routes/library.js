const express = require("express");
const router = express.Router();
const { pool } = require("../db/database");

// GET library
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT data FROM library WHERE id = 1");
    res.json(result.rows[0] ? result.rows[0].data : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update library
router.put("/", async (req, res) => {
  try {
    const library = req.body;
    await pool.query(
      "INSERT INTO library (id, data) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data",
      [JSON.stringify(library)]
    );
    res.json(library);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
