import express from 'express';
import asyncHandler from 'express-async-handler';
import pool from '../db.js';

const router = express.Router();

router.post(
  '/bulk',
  asyncHandler(async (req, res) => {
    const sessions = req.body;

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return res.status(400).json({ error: 'No hay sesiones para guardar.' });
    }

    try {
      const values = [];
      const placeholders = [];

      sessions.forEach((s, i) => {
        const idx = i * 6;
        placeholders.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6})`);
        values.push(
          s.therapist_id,
          s.patient_id,
          s.session_date,
          null, // notes
          null, // photo_url
          null  // audio_url
        );
      });

      const query = `
        INSERT INTO sessions (therapist_id, patient_id, session_date, notes, photo_url, audio_url)
        VALUES ${placeholders.join(',')}
        ON CONFLICT (therapist_id, patient_id, session_date) DO NOTHING
      `;

      await pool.query(query, values);

      res.json({ success: true });
    } catch (error) {
      console.error('Error al guardar sesiones:', error);
      res.status(500).json({ error: 'Error al guardar sesiones.' });
    }
  })
);

// GET /api/sessions?year=2025&month=6
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: 'Parámetros "year" y "month" son requeridos.' });
    }

    try {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month); // de 1 a 12

      // Calcular el primer día del mes
      const startDate = new Date(yearNum, monthNum - 1, 1);

      // Calcular el último día del mes usando 0 del mes siguiente
      const endDate = new Date(yearNum, monthNum, 0); // ej: new Date(2025, 6, 0) => 30/06/2025

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const query = `
        SELECT * FROM sessions 
        WHERE session_date BETWEEN $1 AND $2
      `;

      const { rows } = await pool.query(query, [startStr, endStr]);
      res.json(rows);
    } catch (error) {
      console.error('❌ Error al obtener sesiones:', error);
      res.status(500).json({ error: 'Error al obtener sesiones.' });
    }
  })
);

// Middleware de manejo de errores
router.use((err, req, res, next) => {
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

export default router;
