import express from 'express';
import asyncHandler from 'express-async-handler';
import pool from '../db.js';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { role, active } = req.query;
    let query = 'SELECT * FROM session_rates WHERE 1=1';
    const params = [];

    if (role) {
      params.push(role);
      query += ` AND role = $${params.length}`;
    }

    if (active === 'true') {
      query += ` AND end_date IS NULL`;
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { role, session_rate, start_date } = req.body;

    await pool.query(
      'UPDATE session_rates SET end_date = CURRENT_DATE WHERE role = $1 AND end_date IS NULL',
      [role]
    );

    const result = await pool.query(
      `INSERT INTO session_rates (role, session_rate, start_date)
       VALUES ($1, $2, $3) RETURNING *`,
      [role, session_rate, start_date]
    );

    res.status(201).json(result.rows[0]);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    await pool.query(
      'UPDATE session_rates SET end_date = CURRENT_DATE WHERE id = $1 AND end_date IS NULL',
      [id]
    );

    res.status(200).json({ message: 'Session rate ended successfully' });
  })
);

export default router;