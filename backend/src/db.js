import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      priority VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL,
      due_date DATE NOT NULL
    );
  `);

  const { rowCount } = await pool.query('SELECT id FROM tasks LIMIT 1');
  if (rowCount === 0) {
    await pool.query(`
      INSERT INTO tasks (title, category, priority, status, due_date) VALUES
      ('Konfiguracja sieci VNet i NSG w chmurze Azure', 'DevOps / Cloud', 'Wysoki', 'Ukończone', '2026-10-17'),
      ('Przygotowanie widoku listy zadań w React + Vite', 'Frontend', 'Wysoki', 'Ukończone', '2026-10-24'),
      ('Implementacja REST API w Node.js + Express', 'Backend', 'Wysoki', 'Ukończone', '2026-10-25'),
      ('Automatyczny deployment CI/CD z GitHub Actions do Azure', 'DevOps / CD', 'Wysoki', 'Ukończone', '2026-11-14');
    `);
  }
}