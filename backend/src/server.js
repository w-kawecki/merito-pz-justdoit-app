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

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO',
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      latency_ms: durationMs
    }));
  });
  next();
});

async function healthHandler(req, res) {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'UP',
      service: 'justdoit-backend',
      timestamp: new Date().toISOString(),
      database: 'CONNECTED'
    });
  } catch (err) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      event: 'healthcheck_failed',
      error: err.message
    }));
    res.status(500).json({
      status: 'DOWN',
      service: 'justdoit-backend',
      timestamp: new Date().toISOString(),
      database: 'DISCONNECTED',
      error: err.message
    });
  }
}

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);
app.use('/api/tasks', tasksRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Nie znaleziono zasobu (Endpoint Not Found)' });
});

app.use((err, req, res, next) => {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    event: 'unhandled_error',
    error: err.message
  }));
  res.status(500).json({ error: 'Wewnętrzny błąd serwera (Internal Server Error)' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    event: 'server_started',
    port: PORT
  }));
  initDb()
    .then(() => {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        event: 'database_initialized'
      }));
    })
    .catch((err) => {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        event: 'database_init_failed',
        error: err.message
      }));
    });
});

server.on('error', (err) => {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    event: 'server_start_failed',
    error: err.message
  }));
  process.exit(1);
});
