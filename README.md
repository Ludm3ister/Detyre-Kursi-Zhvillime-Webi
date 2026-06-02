# TaskFlow — MERN Management System

A full-stack task-management web application built with the **MERN** stack
(**M**ongoDB, **E**xpress, **R**eact, **N**ode). It simulates a real management
system with user accounts, role-based access, and full CRUD over tasks.

Requirements are mapped
explicitly in the [Requirements checklist](#-requirements-checklist) section.

---

## ✨ What it does

- **Register / Login** with secure, hashed passwords (bcrypt + salt).
- **JWT authentication** — after logging in, the browser stores a token and
  sends it with every request.
- **Role-based authorization** — two roles:
  - `user`: can create, read, update and delete **their own** tasks.
  - `admin`: can see and manage **all** tasks and **all** users.
- **Task management (CRUD)**: create tasks, edit them, change their status
  (todo / in-progress / done), set priority and due dates, search and filter,
  and delete them.
- **Admin panel**: list every account and remove users.
- **Protected routes** on both the server (middleware) and the client (route
  guards).

---

## 🧱 Tech stack

| Layer        | Technology                                             |
| ------------ | ------------------------------------------------------ |
| Frontend     | React 18 (Vite), React Router, Axios, Context API      |
| Backend      | Node.js, Express                                       |
| Database     | MongoDB + Mongoose (ODM)                               |
| Auth         | JSON Web Tokens (jsonwebtoken), bcryptjs (hashing/salt)|

> **About the database:** this is a MongoDB project.
> MongoDB is a **NoSQL document database**, — Mongoose defines the document shape (the
> "schema") directly in code (see `server/models`). The MongoDB equivalent of a
> "hosted database link" is a **MongoDB Atlas connection string**, explained in
> [Step 2](#2-set-up-the-database-mongodb).

---

## 📁 Project structure

```
mern-task-manager/
├── README.md                  ← you are here
├── .gitignore
│
├── server/                    ← Node + Express + MongoDB API
│   ├── server.js              ← app entry point (Express setup)
│   ├── package.json
│   ├── .env.example           ← copy to .env and fill in
│   ├── config/
│   │   └── db.js              ← MongoDB connection (Mongoose)
│   ├── models/                ← Mongoose schemas (clear data models)
│   │   ├── User.js            ← user + bcrypt password hashing
│   │   └── Task.js            ← task, references its owner
│   ├── controllers/           ← business logic
│   │   ├── authController.js  ← register / login / profile / admin
│   │   └── taskController.js  ← task CRUD
│   ├── routes/                ← URL → controller mapping
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js  ← protect (JWT) + admin (role) guards
│   │   └── errorMiddleware.js ← central error & 404 handling
│   └── utils/
│       ├── generateToken.js   ← signs JWTs
│       └── seed.js            ← optional demo data
│
└── client/                    ← React (Vite) frontend
    ├── index.html
    ├── package.json
    ├── vite.config.js         ← dev server + API proxy
    ├── .env.example
    └── src/
        ├── main.jsx           ← mounts the app (Router + AuthProvider)
        ├── App.jsx            ← all routes (React Router)
        ├── index.css          ← design system / styling
        ├── api/
        │   └── axios.js       ← axios instance, attaches JWT
        ├── context/
        │   └── AuthContext.jsx← global auth state (hooks)
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx ← client-side route guard
        │   ├── TaskForm.jsx   ← create + edit form
        │   └── TaskItem.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx  ← the main CRUD screen
            ├── Admin.jsx      ← admin-only user list
            └── NotFound.jsx
```

---

## 🚀 Getting started

### Prerequisites

- **Node.js 18+** and npm — <https://nodejs.org>
- A **MongoDB database**. Either:
  - **MongoDB Atlas** (free, recommended) — a cloud database, no local install, or
  - **Local MongoDB** installed on your machine.

You will run **two processes**: the API (`server`) and the React app (`client`).

---

### 1. Get the code & install dependencies

From the project root, install both apps:

```bash
# backend
cd server
npm install

# frontend (in a new terminal, or after the first finishes)
cd ../client
npm install
```

---

### 2. Set up the database (MongoDB)

**Option A — MongoDB Atlas (recommended, free cloud DB):**

1. Create a free account at <https://www.mongodb.com/cloud/atlas/register>.
2. Create a free **M0 cluster**.
3. Under **Database Access**, create a database user (username + password).
4. Under **Network Access**, add your IP (or `0.0.0.0/0` to allow all while
   developing).
5. Click **Connect → Drivers** and copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority
   ```
   Replace `<user>` and `<password>` with the database user you created, and
   keep `/taskflow` as the database name.

**Option B — Local MongoDB:** install MongoDB Community Server, start it, and
use `mongodb://127.0.0.1:27017/taskflow`.

---

### 3. Configure environment variables

**Backend** — create `server/.env` (copy from `.env.example`):

```bash
cd server
cp .env.example .env
```

Then edit `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=<paste your MongoDB Atlas or local connection string here>
JWT_SECRET=<any long random string, e.g. run: openssl rand -hex 32>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Frontend** — the defaults work out of the box (the Vite dev server proxies
`/api` to the backend). You only need a `client/.env` if you deploy the API
elsewhere; in that case copy `client/.env.example` to `client/.env` and set
`VITE_API_URL`.

---

### 4. (Optional) Seed demo data

This creates two ready-to-use accounts and a few sample tasks so you can log
in immediately:

```bash
cd server
npm run seed
```

| Role  | Email                | Password   |
| ----- | -------------------- | ---------- |
| Admin | admin@taskflow.com   | admin123   |
| User  | user@taskflow.com    | user123    |

> ⚠️ The seed script **wipes** the users and tasks collections first. Don't run
> it on a database with data you want to keep.

---

### 5. Run the app

Open **two terminals**:

**Terminal 1 — backend API:**

```bash
cd server
npm run dev      # uses nodemon (auto-restart). Or: npm start
```

You should see `MongoDB connected` and `Server running ... on port 5000`.

**Terminal 2 — frontend:**

```bash
cd client
npm run dev
```

Vite prints a local URL (default **http://localhost:5173**). Open it in your
browser.

That's it — register a new account or log in with the seeded demo accounts.

---

## 🔌 API reference

Base URL (local): `http://localhost:5000/api`

### Auth

| Method | Endpoint              | Access       | Description                          |
| ------ | --------------------- | ------------ | ------------------------------------ |
| POST   | `/auth/register`      | Public       | Create an account, returns a JWT     |
| POST   | `/auth/login`         | Public       | Log in, returns a JWT                |
| GET    | `/auth/me`            | Private      | Current user's profile               |
| GET    | `/auth/users`         | Admin only   | List all users                       |
| DELETE | `/auth/users/:id`     | Admin only   | Delete a user                        |

### Tasks

| Method | Endpoint        | Access                | Description                  |
| ------ | --------------- | --------------------- | ---------------------------- |
| GET    | `/tasks`        | Private               | List tasks (own / all if admin) |
| GET    | `/tasks/:id`    | Private (owner/admin) | Get one task                 |
| POST   | `/tasks`        | Private               | Create a task                |
| PUT    | `/tasks/:id`    | Private (owner/admin) | Update a task                |
| DELETE | `/tasks/:id`    | Private (owner/admin) | Delete a task                |

**Auth header** for private routes:

```
Authorization: Bearer <your-jwt-token>
```

**Example — create a task with curl:**

```bash
# 1) log in to get a token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@taskflow.com","password":"user123"}'

# 2) use the returned token
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"My first task","priority":"high"}'
```

---

## 🔐 How authentication & authorization work

1. **Register/Login** → the server hashes the password (`bcrypt.genSalt` +
   `bcrypt.hash`) and, on success, signs a **JWT** containing the user id.
2. The React app stores the token in `localStorage` and an **axios
   interceptor** attaches it to every request as a `Bearer` token.
3. On the server, the **`protect`** middleware verifies the token and loads the
   user onto `req.user`. Routes wrapped with it reject anonymous requests (401).
4. The **`admin`** middleware additionally checks `req.user.role === "admin"`
   (403 if not), powering admin-only endpoints.
5. **Ownership checks** in the task controller ensure a normal user can only
   modify their own tasks, while admins can modify any.
6. On the client, **`ProtectedRoute`** mirrors this in the UI (redirecting
   unauthorized users), but the real enforcement is always on the server.

---

## ✅ Requirements checklist

**Frontend (React)**

- ✅ **Functional components + React Hooks** — every component is a function;
  uses `useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`
  (e.g. `pages/Dashboard.jsx`, `context/AuthContext.jsx`).
- ✅ **React Router for navigation** — `src/App.jsx`, `main.jsx`.
- ✅ **Login / Register forms** — `pages/Login.jsx`, `pages/Register.jsx`.
- ✅ **API interactivity (display / add / update / delete)** —
  `pages/Dashboard.jsx` + `api/axios.js`.

**Backend (Node + Express + MongoDB)**

- ✅ **Code organised into Routes, Models, Controllers, Middlewares** — see
  `server/routes`, `server/models`, `server/controllers`, `server/middleware`.
- ✅ **Authentication & authorization with JWT** — `utils/generateToken.js`,
  `middleware/authMiddleware.js`.
- ✅ **Password encryption with bcrypt + salt** — `models/User.js`
  (`bcrypt.genSalt(10)` + `bcrypt.hash`).
- ✅ **CRUD operations (GET / POST / PUT / DELETE)** — `routes/taskRoutes.js` +
  `controllers/taskController.js`.
- ✅ **Middleware to protect routes** — `protect` and `admin` in
  `middleware/authMiddleware.js`.
- ✅ **Clear Mongoose models** — `models/User.js`, `models/Task.js`.

---
