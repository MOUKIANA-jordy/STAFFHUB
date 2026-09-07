# StaffHub

StaffHub is a full-stack Human Resources Management platform designed to centralize employee information, HR requests, documents, schedules, attendance records, payroll information, and notifications.

The project was developed as an individual Portfolio Project by **Jordy Moukiana**.

---

## Overview

In many organizations, HR information is spread across different tools, emails, and documents.

StaffHub provides a centralized workspace with two main experiences:

### Employee Workspace

Employees can:

- Access their employee profile
- View HR documents
- View payroll information
- Submit HR requests
- Track request status
- View schedules
- View attendance records
- Receive notifications

### HR / Admin Workspace

HR and administrators can:

- Manage employees
- View and process employee requests
- Approve or reject requests
- Access an administrative dashboard
- Monitor HR activity and statistics
- Manage employee-related information

---

## Technologies

### Frontend

- React
- Axios
- Recharts
- CSS
- React Router

### Backend

- Python
- Django
- Django REST Framework
- SimpleJWT
- REST API

### Database

- PostgreSQL
- Django ORM

### Deployment and Services

- Vercel — Frontend deployment
- Render — Backend deployment
- PostgreSQL — Production database
- Brevo — Transactional emails
- Git & GitHub — Version control and project management

---

## Architecture

StaffHub uses a client-server architecture.

User
  |
  v
React Frontend
(Vercel)
  |
  | HTTPS / REST API
  v
Django REST Framework
(Render)
  |
  +------> PostgreSQL Database
  |
  +------> Brevo Email Service

Authentication:
React <---- JWT ----> Django REST API


The React frontend communicates with the Django backend through REST API endpoints.

The backend handles:

- Business logic
- Authentication
- Authorization
- Data validation
- Database operations
- Email-related operations

---

## Authentication and Authorization

StaffHub uses JWT authentication with Django REST Framework and SimpleJWT.

After a successful login, the API provides authentication tokens that are used by the frontend when accessing protected endpoints.

The application supports different roles:

- SALARIE
- RH
- ADMIN

Permissions are applied according to the authenticated user's role.

For example, an employee can access their own information and requests, while HR and administrators have access to administrative features.

---

## Main Features

### Employee

- Secure authentication
- Employee profile
- Documents
- HR requests
- Planning
- Attendance
- Payroll information
- Notifications

### HR / Administrator

- Dashboard
- Employee management
- HR request management
- Request approval and rejection
- HR statistics
- Administrative information

---

## HR Requests

StaffHub supports several types of employee requests, including:

- Salary advance / deposit request
- Advance request
- CET request
- Overtime request

Requests can have different statuses:

- Pending
- Approved
- Rejected

Employees can submit and track requests, while authorized HR or Admin users can process them.

---

## Project Structure


STAFFHUB/
│
├── backend/
│   ├── apps/
│   │   ├── users/
│   │   ├── dossiers/
│   │   ├── demandes/
│   │   ├── documents/
│   │   ├── planning/
│   │   ├── pointage/
│   │   ├── paie/
│   │   ├── notifications/
│   │   ├── messagerie/
│   │   └── remunerations/
│   │
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── Admin/
│   │   ├── Components/
│   │   ├── Layout/
│   │   ├── Pages/
│   │   ├── Services/
│   │   ├── Store/
│   │   ├── Styles/
│   │   └── Utils/
│   │
│   └── package.json
│
└── README.md


---

# Local Installation

## Prerequisites

Before running StaffHub locally, install:

- Git
- Python
- Node.js
- npm
- PostgreSQL

---

## Clone the Repository


git clone https://github.com/MOUKIANA-jordy/STAFFHUB.git
cd STAFFHUB


---

# Backend Setup

Go to the backend directory:

cd backend


Create a Python virtual environment:


python3 -m venv venv


Activate it on Linux/macOS:


source venv/bin/activate

On Windows:

venv\Scripts\activate


Install the Python dependencies:

pip install -r requirements.txt

Create your environment configuration based on `.env.example`.

Then apply the database migrations:

python manage.py migrate


Start the Django development server:

python manage.py runserver

The backend will normally be available at:

http://localhost:8000


---

# Frontend Setup

From the project root:

cd frontend


Install the dependencies:

npm install


Configure the frontend API URL in your environment file.

For local development:


REACT_APP_API_URL=http://localhost:8000

Start React:

npm start


The frontend will normally be available at:


http://localhost:3000



## Environment Variables

Sensitive configuration must not be committed to GitHub.

The real `.env` file is private and ignored by Git.

An `.env.example` file should be used to document the environment variables required to run the application without exposing real credentials.

Examples include:


DATABASE_URL=your_database_url
EMAIL_HOST_USER=your_email_user
EMAIL_HOST_PASSWORD=your_email_password
DEFAULT_FROM_EMAIL=your_email@example.com
REACT_APP_API_URL=http://localhost:8000


Never commit production passwords, API keys, database credentials, or Django secrets.

---

## API

StaffHub exposes REST API endpoints for the main application resources.

Examples:


/api/token/
/api/me/
/api/salaries/
/api/dossiers/
/api/demandes/
/api/documents/
/api/planning/
/api/pointage/
/api/paie/
/api/notifications/


Administrative endpoints include:

```text
/api/admin/stats/
/api/admin/absences/
```

API documentation is available through the project's Swagger/OpenAPI configuration when enabled.

---

## Security

StaffHub includes several security measures:

- JWT authentication
- Protected API endpoints
- Role-based permissions
- Environment variables for sensitive configuration
- CORS configuration
- Backend authorization checks
- HTTPS in production
- Separation between frontend and backend permissions

Sensitive values are not intended to be stored directly in the public repository.

---

## Testing

The main application workflows should be tested before deployment and demonstration.

Important scenarios include:

- Authentication
- Protected routes
- Employee access
- HR/Admin permissions
- Employee request submission
- Request approval/rejection
- API communication
- Production frontend/backend communication

Frontend tests can be run with:

```bash
npm test
```

Backend tests can be run with:

```bash
python manage.py test
```

---

## Deployment

StaffHub uses separate frontend and backend deployments.

### Frontend

The React application is deployed with Vercel.

### Backend

The Django REST API is deployed with Render.

### Database

The production application uses PostgreSQL.

This separation allows the frontend and backend to be configured and deployed independently while communicating through the REST API.

---

## Known Limitations

The current version is an MVP.

Future improvements include:

- Increased automated test coverage
- Persistent cloud storage for uploaded documents
- Improved experience on very small screens
- Two-factor authentication
- Electronic signatures
- Advanced exports
- Real-time communication
- Native mobile application

---

## Project Management

StaffHub was developed as an individual project.

Development was organized using:

- Git
- GitHub
- GitHub Projects
- User stories
- Technical tasks
- Priorities
- Deadlines
- Kanban workflow

Project board:

`https://github.com/users/MOUKIANA-jordy/projects/1/views/1`

---

## Developer

Jordy Moukiana

Full-stack Web Developer  
Holberton School Portfolio Project

GitHub: MOUKIANA-jordy

---

## License

This project was developed for educational and portfolio purposes.
