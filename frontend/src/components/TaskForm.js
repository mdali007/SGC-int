import React, { useState } from 'react';

export default function TaskForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const handle = (e) => {
    e.preventDefault();
    if(!title) return alert('Title required');
    onSubmit({ title, description: desc, priority, due_date: dueDate });
    setTitle(''); setDesc(''); setDueDate(''); setPriority('medium');
  };

  return (
    <form onSubmit={handle}>
      <input placeholder="title" value={title} onChange={e => setTitle(e.target.value)} />
      <input placeholder="description" value={desc} onChange={e => setDesc(e.target.value)} />
      <select value={priority} onChange={e => setPriority(e.target.value)}>
        <option value="low">low</option>
        <option value="medium">medium</option>
        <option value="high">high</option>
      </select>
      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      <button type="submit">Add</button>
    </form>
  );
}
