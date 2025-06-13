// routes/therapists.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM therapists ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching therapists:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get("/:id/homes", async (req, res) => {
  const therapistId = req.params.id;
  try {
    const result = await pool.query(
      `SELECT h.id, h.name
       FROM therapist_home th
       JOIN homes h ON h.id = th.home_id
       WHERE th.therapist_id = $1`,
      [therapistId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener homes del terapista", error);
    res.status(500).json({ error: "Error al obtener homes" });
  }
});


export default router;
