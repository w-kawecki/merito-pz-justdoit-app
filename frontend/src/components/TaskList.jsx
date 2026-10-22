import { useState, useEffect } from 'react';
import mockTasks from '../data/mockTasks.json';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('Wszystkie');

  useEffect(() => {
    setTasks(mockTasks);
  }, []);

  const filteredTasks = filter === 'Wszystkie'
    ? tasks
    : tasks.filter((task) => task.status === filter);

  return (
    <section className="task-section">
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
        <span className="api-badge">API Endpoint: {API_BASE_URL}</span>
      </div>

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
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}