
import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET
router.get('/', async (req, res) => {
  const { therapistId, homeId, year, month } = req.query;
  try {
    const { rows } = await db.query(
      `SELECT * FROM monthly_notes
       WHERE therapist_id = $1 AND home_id = $2 AND year = $3 AND month = $4`,
      [therapistId, homeId, year, month]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar la nota mensual' });
  }
});

// POST
router.post('/', async (req, res) => {
  const { therapistId, homeId, year, month, notes } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO monthly_notes (therapist_id, home_id, year, month, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [therapistId, homeId, year, month, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar la nota mensual' });
  }
});

// PUT
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE monthly_notes
       SET notes = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [notes, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la nota' });
  }
});

export default router;