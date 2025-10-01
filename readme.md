Task Manager Web App (Django + React)

Features:-
-User Authentication: Register & Login using JWT tokens
-Task Management: Create, Edit, Complete, In-Progress, Delete tasks
-Kanban Board: Tasks displayed by status (Pending, In-Progress, Completed)
-Filters & Search: Filter tasks by status, priority, and due date
-Overdue Highlight: Overdue tasks marked in red
-Dashboard: Pie chart showing tasks status counts
-Responsive UI: Modern and professional interface

Tech Stack

Backend: Django, Django REST Framework, Simple JWT

Frontend: React, Axios, Recharts

Database: SQLite (default, can be changed to PostgreSQL)


Setup Instructions

 - Backend - 
cd backend
python3 -m venv venv
source venv/bin/activate  
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

Backend API will be available at http://127.0.0.1:8000/api/


 - Frontend -

cd frontend
npm install
npm start

Frontend will run at http://localhost:3000


 - Running Frontend & Backend Together -

Open two terminal windows.
In one, run backend:
    cd backend
    source venv/bin/activate
    python manage.py runserver

In the other, run frontend:
    cd frontend
    npm start

Open http://localhost:3000 in browser.

Login or Register to start managing tasks



    API Documentation

--Authentication--
Endpoint :- /api/auth/register/  -  POST  - Register new user
            /api/auth/login/     -  POST  - Login & get JWT token

Login Response Example:
{
  "refresh": "jwt_refresh_token",
  "access": "jwt_access_token"
}

--Tasks--
Endpoint :- /api/tasks/         -  POST  - Create a new task
            /api/tasks/{id}/    -  PUT   - Update a task