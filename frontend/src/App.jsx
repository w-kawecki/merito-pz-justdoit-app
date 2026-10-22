import TaskList from './components/TaskList';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>Just do it!</h1>
          <p>Aplikacja do zarządzania zadaniami w stylu „To-Do”.</p>
        </div>
      </header>
      <main>
        <TaskList />
      </main>
    </div>
  );
}