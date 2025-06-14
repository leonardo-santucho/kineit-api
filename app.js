// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import therapistsRouter from './routes/therapists.js';
import sesionRatesRouter from './routes/sessionRates.js';
import patientsRouter from './routes/patients.js';
import homesRouter from './routes/homes.js';
import sessionRoutes from './routes/sessions.js';
import monthlyNotesRoutes from './routes/monthlyNotes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/therapists', therapistsRouter);
app.use('/api/session-rates', sesionRatesRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/homes', homesRouter);
app.use('/api/sessions', sessionRoutes);
app.use('/api/monthly-notes', monthlyNotesRoutes);


app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
