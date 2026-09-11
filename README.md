# StaffHub

StaffHub is a full-stack Human Resources Management platform designed to centralize employee information, administrative requests, documents, schedules, attendance, payroll information, notifications, and communication in a single application.

The project was developed as my Portfolio Project during my Full-Stack Web Development training at Holberton School.

## Screenshot

![StaffHub Dashboard](screenshots/dashboard.png)

## About StaffHub

Managing HR information can quickly become complicated when employee data, documents, schedules, administrative requests, and payroll information are spread across different tools.

StaffHub was created to provide employees and HR teams with a centralized and easy-to-use platform.

The application provides different interfaces and permissions depending on the user's role. Employees can access their personal HR space and submit requests, while HR and administrators can manage employees and process those requests.

## Main Features

### Employee

- Secure authentication
- Personal employee dashboard
- Employee profile management
- Personal and employment information
- Administrative requests
- Salary advance requests
- Advance payment requests
- Overtime requests
- CET payment requests
- Documents management
- Planning and schedules
- Attendance and time tracking
- Payroll information
- Notifications
- Messaging

### HR / Administrator

- HR dashboard
- Employee management
- Employee creation and administration
- Administrative request management
- Request approval and rejection
- Employee statistics
- Absence statistics
- Planning overview
- Role-based permissions
- Notifications and employee information management

## Technologies

### Frontend

- React
- JavaScript
- Axios
- Recharts
- HTML5
- CSS3

### Backend

- Python
- Django
- Django REST Framework
- SimpleJWT
- REST API

### Database

- SQLite for local development
- External production database

### Deployment

- Vercel for the React frontend
- Render for the Django backend

## Architecture

StaffHub uses a separated frontend/backend architecture.

The React frontend is responsible for the user interface and communicates with the Django backend through a REST API.

The Django backend handles business logic, authentication, permissions, database access, and API endpoints.

JWT authentication is used to secure communication between the frontend and backend.

This separation also allows the frontend and backend to be deployed and maintained independently.

## Project Story

I chose to build StaffHub because Human Resources management involves many processes that are often distributed across different systems.

My goal was to create one platform where an employee could find the most important information related to their professional life while providing HR teams with tools to manage employees and administrative requests.

I developed this project independently, which meant working on the complete development lifecycle: identifying the requirements, designing the application, creating the database models and REST API, developing the React interface, implementing authentication and permissions, testing the application, fixing bugs, and deploying the frontend and backend.

Building StaffHub allowed me to work on a project much larger than a simple isolated frontend or backend exercise and helped me better understand how the different parts of a full-stack application communicate.

## Challenges

One of the biggest challenges was implementing authentication and authorization correctly.

StaffHub has several user roles, including employees, HR users, and administrators. Each role must have access only to the appropriate resources. This required implementing permissions both in the Django REST API and in the React interface.

Another important challenge was connecting the React frontend to the Django backend using JWT authentication. Axios interceptors are used to send authentication tokens with protected API requests.

Deployment was also an important learning experience. The frontend and backend are deployed separately, which required configuring API URLs, environment variables, allowed hosts, database settings, and production authentication correctly.

During development, I also encountered and resolved issues involving Django migrations, API permissions, password reset flows, production URLs, frontend builds, and differences between the local and production environments.

## Implemented Features

The current version includes:

- Authentication with JWT
- Employee and HR roles
- Employee profiles
- HR dashboard
- Employee management
- Administrative requests
- Request status management
- Documents
- Planning
- Attendance
- Payroll-related functionality
- Notifications
- Messaging
- Password reset
- Production deployment

## Future Improvements

StaffHub is still evolving. Some improvements planned for future versions include:

- More advanced interactive planning
- Improved attendance management
- More detailed HR analytics
- Improved real-time notifications
- Enhanced messaging
- Improved profile picture management
- Better mobile experience
- Additional automated tests
- Further UI and accessibility improvements

## Installation

### Clone the repository

git clone git@github.com:MOUKIANA-jordy/STAFFHUB.git
cd STAFFHUB


### Backend

Move to the backend directory:

cd backend

Create a virtual environment:

python3 -m venv venv
source venv/bin/activate

Install the dependencies:

pip install -r requirements.txt

Run the migrations:

python3 manage.py migrate


Start the Django server:

python3 manage.py runserver

The backend will normally be available at:

http://127.0.0.1:8000


### Frontend

Open another terminal and move to the frontend directory:

cd frontend

Install the dependencies:

npm install

Start the React application:

npm start


The frontend will normally be available at:


http://localhost:3000

## API

Some of the main API endpoints include:

POST /api/token/
POST /api/token/refresh/
GET  /api/me/

GET  /api/salaries/
GET  /api/demandes/
GET  /api/documents/
GET  /api/planning/
GET  /api/pointage/
GET  /api/paie/
GET  /api/notifications/
GET  /api/conversations/
GET  /api/messages/

StaffHub also provides API documentation through Swagger.

## Developer

I am Jordy Wenceslas Moukiana, a Full-Stack Web Development student at Holberton School.

I developed StaffHub as my Portfolio Project to strengthen my skills in React, Django, REST APIs, authentication, database design, testing, debugging, and application deployment.

I am interested in building practical web applications and continuing to develop my skills as a full-stack developer.

### Connect with me

- LinkedIn: [Jordy Wenceslas Moukiana](https://www.linkedin.com/in/jordy-wenceslas-moukiana-636842274)
- X / Twitter: [@Jordinateur_242](https://x.com/Jordinateur_242)
- Portfolio Project: [StaffHub](https://github.com/MOUKIANA-jordy/STAFFHUB)

## Author

Jordy Wenceslas Moukiana

Full-Stack Web Developer  
Holberton School
