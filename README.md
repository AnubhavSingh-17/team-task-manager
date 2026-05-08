# Team Task Manager

A full-stack team collaboration tool with role-based access control.  
**Live Demo:** [Backend](https://your-backend.railway.app) | [Frontend](https://your-frontend.railway.app)

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v3 |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT (HTTP-only cookies) |
| Deployment | Railway |

## Features
- 🔐 JWT Authentication (register/login/logout)
- 👥 Role-Based Access Control (Admin / Member)
- 📁 Project Management (Admin creates, Members view assigned)
- ✅ Task Management with priority & status tracking
- 📊 Live Dashboard with progress bar & upcoming deadlines
- 📱 Fully responsive (mobile sidebar drawer)

## Local Development

### Backend
```bash
cd backend
npm install
# Create .env with MONGODB_URI, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, PORT=5000
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Register user |
| POST | `/api/v1/auth/login` | Public | Login |
| POST | `/api/v1/auth/logout` | Auth | Logout |
| GET | `/api/v1/projects` | Auth | List projects |
| POST | `/api/v1/projects` | Admin | Create project |
| PUT | `/api/v1/projects/:id` | Admin | Update project |
| DELETE | `/api/v1/projects/:id` | Admin | Delete project |
| GET | `/api/v1/tasks/project/:id` | Auth | Tasks for project |
| POST | `/api/v1/tasks` | Admin | Create task |
| PATCH | `/api/v1/tasks/:id` | Auth | Update task status |
| DELETE | `/api/v1/tasks/:id` | Admin | Delete task |
| GET | `/api/v1/users` | Auth | List all users |

## Environment Variables

### Backend
```
PORT=5000
MONGODB_URI=<your MongoDB Atlas URI>
ACCESS_TOKEN_SECRET=<strong random secret>
ACCESS_TOKEN_EXPIRY=7d
CORS_ORIGIN=https://your-frontend.railway.app
NODE_ENV=production
```

### Frontend
```
VITE_API_URL=https://your-backend.railway.app/api/v1
```
