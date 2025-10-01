import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import TaskForm from '../components/TaskForm';

export default function TasksBoard(){
  const [tasks, setTasks] = useState([]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { refreshAccessToken } = useContext(AuthContext);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('tasks/tasks/');
      setTasks(res.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        // try refresh once
        await refreshAccessToken();
        const res = await api.get('tasks/tasks/');
        setTasks(res.data);
      } else console.error(err);
    }
  };

  const addTask = async (payload) => {
    const res = await api.post('tasks/tasks/', payload);
    setTasks(prev => [res.data, ...prev]);
  };

  const deleteTask = async (id) => {
    await api.delete(`tasks/tasks/${id}/`);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // real-time via websocket
  useEffect(() => {
    let ws;
    try {
      ws = new WebSocket('ws://127.0.0.1:8000/ws/tasks/');
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        // event: 'created'|'updated'|'deleted' and 'task'
        if(data.event === 'created') setTasks(prev => [data.task, ...prev]);
        if(data.event === 'updated') setTasks(prev => prev.map(t => t.id === data.task.id ? data.task : t));
        if(data.event === 'deleted') setTasks(prev => prev.filter(t => t.id !== data.task.id));
      };
    } catch(e){ console.warn('WS failed', e); }
    return () => { if(ws) ws.close(); };
  }, []);

  const overdue = (task) => {
    if(!task.due_date) return false;
    const due = new Date(task.due_date);
    const today = new Date(); today.setHours(0,0,0,0);
    return due < today && task.status !== 'completed';
  };

  return (
    <div style={{padding:20}}>
      <h1>Tasks</h1>
      <TaskForm onSubmit={addTask} />
      <div>
        <input placeholder="Search title/desc" value={q} onChange={e => setQ(e.target.value)} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <ul>
      {tasks
        .filter(t => (q === '' || t.title.includes(q) || (t.description || '').includes(q)))
        .filter(t => (statusFilter === '' || t.status === statusFilter))
        .map(task => (
          <li key={task.id} style={{margin:'8px 0', background: overdue(task)? '#ffdddd' : '#f5f5f5', padding:8}}>
            <b>{task.title}</b> - {task.status} - {task.priority}
            <div>{task.description}</div>
            <small>Due: {task.due_date || '-'}</small>
            <div>
              <button onClick={() => deleteTask(task.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
