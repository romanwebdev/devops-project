import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const fetchTodos = async () => {
    try {
      const res = await fetch('/todos');
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      setError('Could not load your todos. Try refreshing.');
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await fetch('/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      setTitle('');
      fetchTodos();
    } catch (err) {
      setError('Could not add that todo. Try again.');
    }
  };

  const toggleTodo = async (todo) => {
    try {
      await fetch(`/todos/${todo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      fetchTodos();
    } catch (err) {
      setError('Could not update that todo.');
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`/todos/${id}`, { method: 'DELETE' });
      fetchTodos();
    } catch (err) {
      setError('Could not delete that todo.');
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">Todo List</h1>
        <p className="subtitle">
          {todos.length === 0
            ? 'Nothing on your list yet'
            : `${todos.filter((t) => !t.completed).length} of ${todos.length} remaining`}
        </p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={addTodo} className="add-form">
          <input
            className="add-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a todo..."
          />
          <button type="submit" className="add-button">
            Add
          </button>
        </form>

        {todos.length === 0 ? (
          <p className="empty-state">Add your first todo above.</p>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo._id} className="todo-item">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo)}
                  aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
                />
                <span
                  className={`todo-text ${todo.completed ? 'completed' : ''}`}
                >
                  {todo.title}
                </span>
                <button
                  className="delete-button"
                  onClick={() => deleteTodo(todo._id)}
                  aria-label={`Delete "${todo.title}"`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
