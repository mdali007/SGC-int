import React from 'react';
import { PieChart, Pie, Tooltip, Cell } from 'recharts';

export default function Dashboard({ tasks }) {
  const counts = {
    pending: 0, 'in-progress': 0, completed: 0
  };
  tasks.forEach(t => counts[t.status] = (counts[t.status] || 0) + 1);
  const data = [
    { name: 'Pending', value: counts.pending },
    { name: 'In Progress', value: counts['in-progress'] },
    { name: 'Completed', value: counts.completed },
  ];
  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{display:'flex', gap:20}}>
        <div>
          <h4>Counts</h4>
          <div>Pending: {counts.pending}</div>
          <div>In Progress: {counts['in-progress']}</div>
          <div>Completed: {counts.completed}</div>
        </div>
        <div>
          <PieChart width={200} height={200}>
            <Pie data={data} dataKey="value" cx={100} cy={100} outerRadius={80} label>
              {data.map((entry, index) => <Cell key={index} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </div>
  );
}
