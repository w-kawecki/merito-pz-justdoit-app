import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tasksRouter from './routes/tasks.js';
import { initDb, pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || '*';
const MAX_TITLE_LENGTH = 120;
const UNSAFE_HTML_REGEX = /<[^>]*>|javascript:/i;

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: '50kb' }));

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

function validateTaskPayload(req, res, next) {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return next();
  }

  const body = req.body || {};
  const isCreate = req.method === 'POST';

  if (isCreate || body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      return res.status(400).json({
        error: 'Tytuł zadania jest wymagany i nie może być pusty.'
      });
    }

    const trimmedTitle = body.title.trim();
    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      return res.status(400).json({
        error: `Tytuł zadania jest zbyt długi (maksymalnie ${MAX_TITLE_LENGTH} znaków).`
      });
    }

    if (UNSAFE_HTML_REGEX.test(trimmedTitle)) {
      return res.status(400).json({
        error: 'Tytuł zadania zawiera niedozwolone znaki specjalne lub znaczniki HTML.'
      });
    }

    req.body.title = trimmedTitle;
  }

  for (const field of ['category', 'priority', 'status', 'description']) {
    if (typeof body[field] === 'string') {
      if (body[field].trim().length > 250) {
        return res.status(400).json({
          error: `Pole "${field}" przekracza maksymalną długość (250 znaków).`
        });
      }
      if (UNSAFE_HTML_REGEX.test(body[field])) {
        return res.status(400).json({
          error: `Pole "${field}" zawiera niedozwolone znaczniki HTML.`
        });
      }
      req.body[field] = body[field].trim();
    }
  }

  return next();
}

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
app.use('/api/tasks', validateTaskPayload, tasksRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Nie znaleziono zasobu (Endpoint Not Found)' });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Nieprawidłowy format danych JSON w żądaniu.'
    });
  }

  const dbErrorCodes = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', '57P01', '08006', '08001'];
  if (err && dbErrorCodes.includes(err.code)) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      event: 'database_unavailable',
      code: err.code,
      error: err.message
    }));
    return res.status(503).json({
      error: 'Usługa bazy danych jest chwilowo niedostępna. Spróbuj ponownie za chwilę.'
    });
  }

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    event: 'unhandled_error',
    error: err.message
  }));
  return res.status(500).json({
    error: 'Wewnętrzny błąd serwera (Internal Server Error). Spróbuj ponownie później.'
  });
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
