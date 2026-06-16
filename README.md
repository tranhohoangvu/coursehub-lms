# 🎓 CourseHub — Full-Stack Learning Management System (LMS)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**CourseHub** is a clean, lightweight, and high-performance Full-Stack Learning Management System (LMS) designed as a portfolio showcase for a **Backend Developer** role. 

This project demonstrates core backend engineering principles, including database schema design, JWT-based Role-Based Access Control (RBAC), raw SQL query optimization using the native `pg` driver (no ORM like Prisma/Sequelize), and modular MVC architecture.

> [!NOTE]
> **Lightweight & High-Performance Design:** This codebase intentionally avoids Docker and heavy ORMs (like Prisma) to ensure rapid cold-start times, eliminate engine-download bottlenecks in network-restricted environments, and demonstrate low-level database mastery.

---

## 🚀 Key Features

### 👤 Authentication & Authorization (RBAC)
*   Secure authentication using **JSON Web Tokens (JWT)**.
*   **Role-Based Access Control** with three distinct roles:
    *   `ADMIN`: Access to dashboard, system analytics, and user/course overview.
    *   `INSTRUCTOR`: Create and manage course content, lessons, and curriculums.
    *   `STUDENT`: Browse catalog, enroll in courses, track learning progress, and write reviews.

### 📚 Course & Curriculum Management
*   Detailed course page featuring curriculum breakdowns, lessons, and progress tracking.
*   Interactive review system for courses with ratings and comments.
*   Dynamic enrollment state and learning progress tracking per student.

### 🛒 Cart & Mock Checkout
*   Persistent shopping cart stored in database and synced across devices.
*   Mock checkout process simulating order creation and automatic enrollment.

### 📊 Admin Dashboard
*   Aggregated reports on platform revenue, total enrollments, and top-selling courses.
*   System audit tables and overview.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Node.js, Express.js | Fast, minimalist web framework for building APIs. |
| **Database** | PostgreSQL (Supabase / Cloud) | Robust relational database. |
| **Driver** | `pg` (node-postgres) | Native PostgreSQL client for writing raw, optimized SQL queries. |
| **Frontend** | React, Vite, CSS | Modern SPA with lightning-fast development server. |
| **Auth** | JWT (jsonwebtoken) | Stateless session security with authorization middleware. |

---

## 📂 Directory Structure

```text
coursehub/
├── backend/
│   ├── sql/
│   │   └── schema.sql          # DB tables, keys, and relational constraints
│   ├── scripts/
│   │   ├── init-db.js         # Database connection init script
│   │   └── seed.js            # Seed script inserting mock data for roles
│   ├── src/
│   │   ├── controllers/       # Controller logic processing requests
│   │   ├── middlewares/       # JWT auth & error handling middlewares
│   │   ├── routes/            # Express route declarations
│   │   ├── utils/             # Helper functions (token helpers, etc.)
│   │   ├── db.js              # pg pool database instance
│   │   └── server.js          # Express entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios client instance and API layers
│   │   ├── components/        # Reusable UI parts (CourseCard, ProtectedRoute)
│   │   ├── context/           # React context for Auth state management
│   │   ├── pages/             # App pages (Home, Login, Admin, Instructor...)
│   │   ├── App.jsx            # Routing and core layout
│   │   └── style.css          # Customized vanilla CSS design system
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v18.x or higher)
*   A running PostgreSQL Database instance (e.g., Supabase, local Postgres, or Render)

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables:
   *   Copy `.env.example` to `.env`:
       ```bash
       cp .env.example .env
       ```
   *   Open `.env` and fill in your connection string and token secret:
       ```env
       DATABASE_URL=postgresql://your_user:your_password@your_host:5432/your_db
       JWT_SECRET=your_super_secure_jwt_secret_key
       PORT=5000
       ```
4. Initialize the Database and Seed mock data:
   ```bash
   npm run db:init
   npm run seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
   *The backend API will run on:* `http://localhost:5000`

---

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variable:
   *   Copy `.env.example` to `.env`:
       ```bash
       cp .env.example .env
       ```
   *   Confirm the API base URL in `.env` matches your backend:
       ```env
       VITE_API_URL=http://localhost:5000/api
       ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will run on:* `http://localhost:5173`

---

## 🔑 Demo Accounts

Use these pre-seeded accounts to experience the role-based access control flows:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `123456` | Complete site control & statistics view. |
| **Instructor** | `teacher@example.com` | `123456` | Course creation, management, & lessons addition. |
| **Student** | `student@example.com` | `123456` | Course purchase, enrollment, learning lessons & reviews. |

---

## 🛠️ Troubleshooting (Windows)

If you encounter issues where `node_modules` is locked on Windows during package updates, close your terminal/VS Code and run the following commands in an administrator PowerShell:

```powershell
taskkill /F /IM node.exe
rmdir /s /q node_modules
npm install
```

---

## 📝 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
