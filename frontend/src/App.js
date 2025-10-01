import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Legend } from "recharts";

function App() {
  const [user, setUser] = useState(() => localStorage.getItem("access") || "");
  const [page, setPage] = useState("login"); // login | register | tasks

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "" });

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterDue, setFilterDue] = useState("");

  const statusColors = {
    pending: "#FFBB28",
    "in-progress": "#00C49F",
    completed: "#FF8042"
  };

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = () => {
    axios.get("http://127.0.0.1:8000/api/tasks/", {
      headers: { Authorization: `Bearer ${user}` }
    })
    .then(res => setTasks(res.data))
    .catch(err => console.log(err));
  };

  const handleLogin = () => {
    axios.post("http://127.0.0.1:8000/api/auth/login/", loginData)
      .then(res => {
        localStorage.setItem("access", res.data.access);
        setUser(res.data.access);
        setPage("tasks");
      })
      .catch(err => alert("Login failed"));
  };

  const handleRegister = () => {
    axios.post("http://127.0.0.1:8000/api/auth/register/", registerData)
      .then(() => {
        alert("Registered! Please login.");
        setPage("login");
      })
      .catch(err => alert("Registration failed"));
  };

  const addTask = () => {
    if (!newTask) return;
    axios.post("http://127.0.0.1:8000/api/tasks/", 
      { title: newTask, status: "pending", priority: "medium" },
      { headers: { Authorization: `Bearer ${user}` } }
    )
    .then(res => {
      setTasks([...tasks, res.data]);
      setNewTask("");
    })
    .catch(err => console.log(err));
  };

  const completeTask = (task) => {
    axios.put(`http://127.0.0.1:8000/api/tasks/${task.id}/`,
      { ...task, status: "completed" },
      { headers: { Authorization: `Bearer ${user}` } }
    )
    .then(fetchTasks)
    .catch(err => console.log(err));
  };

  const updateStatus = (task, status) => {
    axios.put(`http://127.0.0.1:8000/api/tasks/${task.id}/`,
      { ...task, status: status },
      { headers: { Authorization: `Bearer ${user}` } }
    )
    .then(fetchTasks)
    .catch(err => console.log(err));
  };

  const deleteTask = (taskId) => {
    axios.delete(`http://127.0.0.1:8000/api/tasks/${taskId}/`,
      { headers: { Authorization: `Bearer ${user}` } }
    )
    .then(() => setTasks(tasks.filter(t => t.id !== taskId)))
    .catch(err => console.log(err));
  };

  const editTask = (task) => {
    const newTitle = prompt("Edit task title", task.title);
    if (!newTitle) return;
    axios.put(`http://127.0.0.1:8000/api/tasks/${task.id}/`,
      { ...task, title: newTitle },
      { headers: { Authorization: `Bearer ${user}` } }
    ).then(fetchTasks)
    .catch(err => console.log(err));
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    setUser("");
    setPage("login");
  };

  const filteredTasks = tasks.filter(task => 
    (filterStatus ? task.status === filterStatus : true) &&
    (filterPriority ? task.priority === filterPriority : true) &&
    (filterDue ? task.due_date === filterDue : true)
  );

  const statusData = [
    { name: "Pending", value: tasks.filter(t => t.status==="pending").length },
    { name: "In-Progress", value: tasks.filter(t => t.status==="in-progress").length },
    { name: "Completed", value: tasks.filter(t => t.status==="completed").length }
  ];

  // ----- Styled Login Page -----
  if (page === "login") {
    return (
      <div style={centerPageStyle("#2980b9","#6dd5fa")}>
        <div style={cardStyle}>
          <h2 style={{marginBottom:"20px"}}>Login</h2>
          <input placeholder="Username" value={loginData.username} 
                 onChange={e => setLoginData({...loginData, username: e.target.value})}
                 style={inputStyle} />
          <input type="password" placeholder="Password" value={loginData.password} 
                 onChange={e => setLoginData({...loginData, password: e.target.value})}
                 style={inputStyle} />
          <button onClick={handleLogin} style={buttonStyle}>Login</button>
          <p style={{marginTop:"15px"}}>No account? <span style={{color:"#2980b9", cursor:"pointer"}} onClick={()=>setPage("register")}>Register</span></p>
        </div>
      </div>
    );
  }

  // ----- Styled Register Page -----
  if (page === "register") {
    return (
      <div style={centerPageStyle("#6dd5fa","#2980b9")}>
        <div style={cardStyle}>
          <h2 style={{marginBottom:"20px"}}>Register</h2>
          <input placeholder="Username" value={registerData.username} 
                 onChange={e => setRegisterData({...registerData, username: e.target.value})}
                 style={inputStyle} />
          <input placeholder="Email" value={registerData.email} 
                 onChange={e => setRegisterData({...registerData, email: e.target.value})}
                 style={inputStyle} />
          <input type="password" placeholder="Password" value={registerData.password} 
                 onChange={e => setRegisterData({...registerData, password: e.target.value})}
                 style={inputStyle} />
          <button onClick={handleRegister} style={buttonStyle}>Register</button>
          <p style={{marginTop:"15px"}}>Already have account? <span style={{color:"#2980b9", cursor:"pointer"}} onClick={()=>setPage("login")}>Login</span></p>
        </div>
      </div>
    );
  }

  // ----- Task Dashboard -----
  return (
    <div style={{ padding: "20px" }}>
      <h1>Task Manager Dashboard ✅</h1>
      <button onClick={handleLogout} style={{marginBottom:"10px", padding:"5px 10px"}}>Logout</button>
      
      <div style={{ marginTop: "20px" }}>
        <input type="text" placeholder="New task..." value={newTask} onChange={e => setNewTask(e.target.value)} style={{padding:"5px"}}/>
        <button onClick={addTask} style={{padding:"5px 10px", marginLeft:"5px"}}>Add Task</button>
      </div>

      {/* Filters */}
      <div style={{ margin: "20px 0" }}>
        <select onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In-Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select onChange={e => setFilterPriority(e.target.value)} style={{ marginLeft: "10px" }}>
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input type="date" onChange={e => setFilterDue(e.target.value)} style={{ marginLeft: "10px" }} />
      </div>

      {/* Kanban Board */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
        {["pending","in-progress","completed"].map(status => (
          <div key={status} style={{
            width: "32%",
            padding: "10px",
            borderRadius: "10px",
            background: status === "pending" ? "#FFF3E0" : status === "in-progress" ? "#E0F7FA" : "#E8F5E9",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ textAlign: "center", textTransform: "uppercase" }}>{status}</h3>
            {filteredTasks.filter(t => t.status === status).map(task => (
              <div key={task.id} style={{
                padding: "10px",
                margin: "10px 0",
                backgroundColor: task.due_date && new Date(task.due_date) < new Date() ? "#FFCDD2" : "#fff",
                borderLeft: task.priority === "high" ? "5px solid #d32f2f" :
                            task.priority === "medium" ? "5px solid #fbc02d" : "5px solid #388e3c",
                borderRadius: "5px",
                transition: "transform 0.2s",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <strong>{task.title}</strong><br/>
                {task.due_date && <small>Due: {task.due_date}</small>} <br/>
                <div style={{ marginTop: "5px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  <button style={taskButtonStyle} onClick={() => editTask(task)}>Edit ✏️</button>
                  {task.status === "pending" && (
                    <>
                      <button style={taskButtonStyle} onClick={() => updateStatus(task,"in-progress")}>In-Progress ⏳</button>
                      <button style={taskButtonStyle} onClick={() => completeTask(task)}>Complete ✅</button>
                    </>
                  )}
                  {task.status === "in-progress" && (
                    <button style={taskButtonStyle} onClick={() => completeTask(task)}>Complete ✅</button>
                  )}
                  <button style={deleteButtonStyle} onClick={() => deleteTask(task.id)}>Delete 🗑️</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pie Chart Dashboard */}
      <div style={{ marginTop: "40px" }}>
        <h2>Tasks Status Chart</h2>
        <PieChart width={300} height={300}>
          <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            <Cell fill="#FFBB28"/>
            <Cell fill="#00C49F"/>
            <Cell fill="#FF8042"/>
          </Pie>
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </div>
    </div>
  );
}

// ----- Styles -----
const inputStyle = {
  width:"100%",
  padding:"8px",
  margin:"8px 0",
  borderRadius:"5px",
  border:"1px solid #ccc"
};

const buttonStyle = {
  width:"100%",
  padding:"10px",
  background:"#2980b9",
  color:"#fff",
  border:"none",
  borderRadius:"5px",
  cursor:"pointer",
  marginTop:"10px"
};

const taskButtonStyle = {
  padding: "5px 8px",
  border: "none",
  borderRadius: "5px",
  background: "#1976d2",
  color: "#fff",
  cursor: "pointer",
  fontSize: "12px"
};

const deleteButtonStyle = {
  ...taskButtonStyle,
  background: "#d32f2f"
};

const cardStyle = {
  background:"#fff",
  padding:"40px",
  borderRadius:"10px",
  boxShadow:"0 10px 20px rgba(0,0,0,0.3)",
  width:"300px",
  textAlign:"center"
};

const centerPageStyle = (color1,color2) => ({
  height:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  background: `linear-gradient(120deg,${color1},${color2})`
});

export default App;
