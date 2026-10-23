import { Router } from 'express';
import { pool } from '../db.js';
import { validateTaskPayload } from '../validators/taskValidator.js';

const router = Router();

const SELECT_FIELDS = `
  id,
  title,
  category,
  priority,
  status,
  TO_CHAR(due_date, 'YYYY-MM-DD') AS "dueDate"
`;

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT ${SELECT_FIELDS} FROM tasks ORDER BY id ASC`);
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Parametr ID musi być dodatnią liczbą całkowitą' });
    }

    const result = await pool.query(`SELECT ${SELECT_FIELDS} FROM tasks WHERE id = $1`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Zadanie o ID ${id} nie zostało znalezione` });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const errors = validateTaskPayload(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Błąd walidacji danych', details: errors });
    }

    const { title, category, priority, status, dueDate } = req.body;
    const result = await pool.query(
      `INSERT INTO tasks (title, category, priority, status, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${SELECT_FIELDS}`,
      [title.trim(), category.trim(), priority, status, dueDate]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Parametr ID musi być dodatnią liczbą całkowitą' });
    }

    const errors = validateTaskPayload(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Błąd walidacji danych', details: errors });
    }

    const { title, category, priority, status, dueDate } = req.body;
    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, category = $2, priority = $3, status = $4, due_date = $5
       WHERE id = $6
       RETURNING ${SELECT_FIELDS}`,
      [title.trim(), category.trim(), priority, status, dueDate, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Zadanie o ID ${id} nie zostało znalezione` });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Parametr ID musi być dodatnią liczbą całkowitą' });
    }

    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Zadanie o ID ${id} nie zostało znalezione` });
    }

    res.status(200).json({ message: `Zadanie o ID ${id} zostało usunięte`, id });
  } catch (err) {
    next(err);
  }
});

export default router;