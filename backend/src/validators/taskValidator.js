const ALLOWED_PRIORITIES = ['Niski', 'Średni', 'Wysoki'];
const ALLOWED_STATUSES = ['Do zrobienia', 'W trakcie', 'Ukończone'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function validateTaskPayload(body, isPartial = false) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return ['Nieprawidłowy format ciała żądania JSON'];
  }

  if (!isPartial || body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length < 3) {
      errors.push('Pole "title" jest wymagane i musi być tekstem o długości min. 3 znaków');
    }
  }

  if (!isPartial || body.category !== undefined) {
    if (typeof body.category !== 'string' || body.category.trim().length < 2) {
      errors.push('Pole "category" jest wymagane i musi być poprawnym tekstem');
    }
  }

  if (!isPartial || body.priority !== undefined) {
    if (!ALLOWED_PRIORITIES.includes(body.priority)) {
      errors.push(`Pole "priority" musi przyjmować jedną z wartości: ${ALLOWED_PRIORITIES.join(', ')}`);
    }
  }

  if (!isPartial || body.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(body.status)) {
      errors.push(`Pole "status" musi przyjmować jedną z wartości: ${ALLOWED_STATUSES.join(', ')}`);
    }
  }

  if (!isPartial || body.dueDate !== undefined) {
    if (typeof body.dueDate !== 'string' || !DATE_REGEX.test(body.dueDate) || isNaN(Date.parse(body.dueDate))) {
      errors.push('Pole "dueDate" musi być poprawną datą w formacie YYYY-MM-DD');
    }
  }

  return errors;
}