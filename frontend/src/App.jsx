import TaskList from './components/TaskList';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>Just do it!</h1>
          <p>System zarządzania zadaniami (Architektura 3-Tier w chmurze Microsoft Azure)</p>
        </div>
      </header>
      <main>
        <TaskList />
      </main>
    </div>
  );
}