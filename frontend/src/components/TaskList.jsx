import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const INITIAL_FORM = {
  title: '',
  category: '',
  priority: 'Średni',
  status: 'Do zrobienia',
  dueDate: ''
};

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('Wszystkie');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`);
      if (!response.ok) {
        throw new Error(`Błąd pobierania danych (HTTP ${response.status})`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setApiError(err.message || 'Nie udało się połączyć z serwerem API');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const validateForm = () => {
    const errors = {};
    if (!formData.title || formData.title.trim().length < 3) {
      errors.title = 'Tytuł zadania musi zawierać co najmniej 3 znaki';
    }
    if (!formData.category || formData.category.trim().length < 2) {
      errors.category = 'Kategoria musi zawierać co najmniej 2 znaki';
    }
    if (!['Niski', 'Średni', 'Wysoki'].includes(formData.priority)) {
      errors.priority = 'Wybierz prawidłowy priorytet z listy';
    }
    if (!['Do zrobienia', 'W trakcie', 'Ukończone'].includes(formData.status)) {
      errors.status = 'Wybierz prawidłowy status z listy';
    }
    if (!formData.dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(formData.dueDate)) {
      errors.dueDate = 'Podaj prawidłową datę w formacie RRRR-MM-DD';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('error', 'Formularz zawiera błędy walidacji');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId
        ? `${API_BASE_URL}/tasks/${editingId}`
        : `${API_BASE_URL}/tasks`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.details ? data.details.join(', ') : data.error;
        throw new Error(msg || `Błąd zapisu (HTTP ${response.status})`);
      }

      showToast(
        'success',
        editingId
          ? `Zadanie #${editingId} zostało zaktualizowane`
          : 'Nowe zadanie zostało dodane do bazy danych'
      );
      setFormData(INITIAL_FORM);
      setEditingId(null);
      setFormErrors({});
      await fetchTasks();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (task) => {
    setEditingId(task.id);
    setFormData({
      title: task.title,
      category: task.category,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate
    });
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Błąd usuwania (HTTP ${response.status})`);
      }
      if (selectedTask && selectedTask.id === id) {
        setSelectedTask(null);
      }
      showToast('success', `Zadanie #${id} zostało usunięte`);
      await fetchTasks();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Nie udało się pobrać szczegółów zadania');
      }
      setSelectedTask(data);
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const filteredTasks = filter === 'Wszystkie'
    ? tasks
    : tasks.filter((task) => task.status === filter);

  return (
    <section className="task-section">
      {toast && (
        <div className={`toast-banner toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}

      <div className="form-card">
        <h2>{editingId ? `Edycja zadania #${editingId}` : 'Dodaj nowe zadanie'}</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Tytuł zadania *</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="np. Wdrożenie kontenera w Azure"
                value={formData.title}
                onChange={handleInputChange}
                className={formErrors.title ? 'input-error' : ''}
              />
              {formErrors.title && <span className="field-error">{formErrors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Kategoria *</label>
              <input
                id="category"
                name="category"
                type="text"
                placeholder="np. DevOps / Backend"
                value={formData.category}
                onChange={handleInputChange}
                className={formErrors.category ? 'input-error' : ''}
              />
              {formErrors.category && <span className="field-error">{formErrors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priorytet *</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="Niski">Niski</option>
                <option value="Średni">Średni</option>
                <option value="Wysoki">Wysoki</option>
              </select>
              {formErrors.priority && <span className="field-error">{formErrors.priority}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Do zrobienia">Do zrobienia</option>
                <option value="W trakcie">W trakcie</option>
                <option value="Ukończone">Ukończone</option>
              </select>
              {formErrors.status && <span className="field-error">{formErrors.status}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Termin wykonania *</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
                className={formErrors.dueDate ? 'input-error' : ''}
              />
              {formErrors.dueDate && <span className="field-error">{formErrors.dueDate}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? 'Zapisywanie...'
                : editingId
                  ? 'Zapisz zmiany'
                  : 'Dodaj zadanie'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                Anuluj edycję
              </button>
            )}
          </div>
        </form>
      </div>

      {selectedTask && (
        <div className="details-card">
          <div className="details-header">
            <h3>Szczegóły zadania #{selectedTask.id} (GET /api/tasks/{selectedTask.id})</h3>
            <button className="btn-secondary btn-sm" onClick={() => setSelectedTask(null)}>
              Zamknij
            </button>
          </div>
          <div className="details-grid">
            <div><strong>Tytuł:</strong> {selectedTask.title}</div>
            <div><strong>Kategoria:</strong> {selectedTask.category}</div>
            <div><strong>Priorytet:</strong> {selectedTask.priority}</div>
            <div><strong>Status:</strong> {selectedTask.status}</div>
            <div><strong>Termin:</strong> {selectedTask.dueDate}</div>
          </div>
        </div>
      )}

      <div className="toolbar">
        <div className="filters">
          {['Wszystkie', 'Do zrobienia', 'W trakcie', 'Ukończone'].map((status) => (
            <button
              key={status}
              className={filter === status ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <span className="api-badge">API Endpoint: {API_BASE_URL}/tasks</span>
      </div>

      {isLoading ? (
        <div className="state-box loading-box">
          <div className="spinner"></div>
          <span>Ładowanie zadań z bazy danych PostgreSQL...</span>
        </div>
      ) : apiError ? (
        <div className="state-box error-box">
          <span>Błąd połączenia z API: {apiError}</span>
          <button className="btn-secondary btn-sm" onClick={fetchTasks}>
            Spróbuj ponownie
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="task-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Zadanie</th>
                <th>Kategoria</th>
                <th>Priorytet</th>
                <th>Status</th>
                <th>Termin</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">
                    Brak zadań spełniających wybrane kryteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id}>
                    <td>#{task.id}</td>
                    <td className="task-title">{task.title}</td>
                    <td>{task.category}</td>
                    <td>
                      <span className={`badge priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill">{task.status}</span>
                    </td>
                    <td>{task.dueDate}</td>
                    <td className="actions-cell">
                      <button
                        className="btn-action btn-view"
                        onClick={() => handleViewDetails(task.id)}
                      >
                        Szczegóły
                      </button>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEditClick(task)}
                      >
                        Edytuj
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(task.id)}
                      >
                        Usuń
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}