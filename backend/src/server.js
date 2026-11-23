import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tasksRouter from './routes/tasks.js';
import { initDb, pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || '*';

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'OK', service: 'justdoit-backend', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'DEGRADED', service: 'justdoit-backend', database: err.message });
  }
});

app.use('/api/tasks', tasksRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Nie znaleziono zasobu (Endpoint Not Found)' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Wewnętrzny błąd serwera (Internal Server Error)' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
  initDb()
    .then(() => {
      console.log('Database initialized successfully');
    })
    .catch((err) => {
      console.error('Database initialization failed:', err.message);
    });
});

server.on('error', (err) => {
  console.error('Server failed to start:', err.message);
  process.exit(1);
});
