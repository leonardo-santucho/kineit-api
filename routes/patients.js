import express from 'express';
import asyncHandler from 'express-async-handler';
import pool from '../db.js';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    try {
      const { active } = req.query;
      let query = 'SELECT * FROM patients WHERE 1=1';
      const params = [];

      if (active === 'true') {
        query += ` AND active IS TRUE`;
      }

      const { rows } = await pool.query(query, params);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching patients:', error);
      next(error); // Pasa el error al middleware de manejo de errores
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