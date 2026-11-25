import { describe, it, expect } from 'vitest';
import request from 'supertest';

const API_URL = (process.env.LIVE_API_URL || process.env.LIVE_APP_URL || 'http://localhost:8080').replace(/\/$/, '');

describe('Integracja REST API - JustDoIt Backend', () => {
  let createdTaskId = null;

  it('GET /health powinien zwrócić 200 OK oraz status połączenia z bazą', async () => {
    const response = await request(API_URL)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('status', 'UP');
    expect(response.body).toHaveProperty('database', 'CONNECTED');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('GET /api/tasks powinien pobrać listę zadań ze statusem 200 OK', async () => {
    const response = await request(API_URL)
      .get('/api/tasks')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
    }
  });

  it('POST /api/tasks powinien utworzyć nowe zadanie ze statusem 201 Created', async () => {
    const uniqueTitle = `Test Integracyjny API ${Date.now()}`;
    const newTask = {
      title: uniqueTitle,
      category: 'DevOps / QA',
      priority: 'Wysoki',
      status: 'Do zrobienia',
      due_date: '2026-12-01',
      dueDate: '2026-12-01'
    };

    const response = await request(API_URL)
      .post('/api/tasks')
      .send(newTask)
      .expect('Content-Type', /json/)
      .expect(201);

    const created = response.body.task || response.body;
    expect(created).toHaveProperty('id');
    expect(created.title).toBe(uniqueTitle);
    createdTaskId = created.id;
  });

  it('GET /api/tasks powinien zawierać nowo zapisane zadanie w bazie PostgreSQL', async () => {
    expect(createdTaskId).not.toBeNull();

    const response = await request(API_URL)
      .get('/api/tasks')
      .expect('Content-Type', /json/)
      .expect(200);

    const found = response.body.find((task) => Number(task.id) === Number(createdTaskId));
    expect(found).toBeDefined();
  });

  it('DELETE /api/tasks/:id powinien usunąć testowe zadanie (sprzątanie)', async () => {
    expect(createdTaskId).not.toBeNull();

    const response = await request(API_URL)
      .delete(`/api/tasks/${createdTaskId}`);

    expect([200, 204]).toContain(response.status);
  });

  it('GET /api/nonexistent powinien zwrócić 404 Not Found i poprawny JSON', async () => {
    const response = await request(API_URL)
      .get('/api/nonexistent-endpoint-check')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });
});
