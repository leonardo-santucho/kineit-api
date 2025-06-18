import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/therapists
router.get('/', async (req, res) => {
  const { home_id } = req.query;

  try {
    let query = 'SELECT * FROM therapists ORDER BY name';
    const params = [];

    if (home_id) {
      query = `
        SELECT t.*
        FROM therapists t
        JOIN therapist_home th ON th.therapist_id = t.id
        WHERE th.home_id = $1
        ORDER BY t.name
      `;
      params.push(home_id);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching therapists:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/therapists/:id/homes
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
