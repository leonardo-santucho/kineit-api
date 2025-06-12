import express from 'express';
import asyncHandler from 'express-async-handler';
import pool from '../db.js';

const router = express.Router();

// backend: routes/sessions.js
router.post(
  '/bulk',
  asyncHandler(async (req, res) => {
    const { year, month, sessions } = req.body;

    if (!year || !month) {
      return res.status(400).json({ error: 'Parámetros "year" y "month" requeridos.' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // Borrar sesiones existentes del mes antes de insertar
    await pool.query(
      `DELETE FROM sessions WHERE session_date BETWEEN $1 AND $2`,
      [startStr, endStr]
    );

    console.log(`🧹 Sesiones borradas del ${startStr} al ${endStr}`);

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return res.json({ success: true, message: 'Sesiones eliminadas.' });
    }

    // Buscar IDs de kinesiólogos
    const initialsSet = new Set(sessions.map(s => s.therapist_initials));
    const initials = Array.from(initialsSet);

    const { rows: therapists } = await pool.query(
      `SELECT id, initials FROM therapists WHERE initials = ANY($1)`,
      [initials]
    );

    const initialsToId = {};
    therapists.forEach(t => {
      initialsToId[t.initials] = t.id;
    });

    const values = [];
    const placeholders = [];

    sessions.forEach((s, i) => {
      const therapistId = initialsToId[s.therapist_initials];
      if (!therapistId) {
        throw new Error(`No se encontró el therapist_id para: ${s.therapist_initials}`);
      }

      const idx = i * 6;
      placeholders.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6})`);
      values.push(
        therapistId,
        s.patient_id,
        s.session_date,
        s.notes || null,
        s.photo_url || null,
        s.audio_url || null
      );
    });

    const insertQuery = `
      INSERT INTO sessions (therapist_id, patient_id, session_date, notes, photo_url, audio_url)
      VALUES ${placeholders.join(',')}
    `;

    await pool.query(insertQuery, values);
    res.json({ success: true });
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ error: 'Parámetros "year" y "month" son requeridos.' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const query = `
      SELECT s.*, t.initials as therapist_initials
      FROM sessions s
      LEFT JOIN therapists t ON s.therapist_id = t.id
      WHERE s.session_date BETWEEN $1 AND $2
    `;

    const { rows } = await pool.query(query, [startStr, endStr]);
    res.json(rows);
  })
);

export default router;
