// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import therapistsRouter from './routes/therapists.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/therapists', therapistsRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
