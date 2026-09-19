# 🎓 CourseHub — Full-Stack Learning Management System (LMS)

![CourseHub Showcase Banner](./thumbnail.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Security: Helmet](https://img.shields.io/badge/Security-Helmet%20%2B%20Rate%20Limit-blue.svg)](https://helmetjs.github.io/)
[![Tests](https://img.shields.io/badge/Tests-Node%20Native%20Runner-success.svg)](https://nodejs.org/api/test.html)

**CourseHub** is a production-ready, lightweight, and high-performance Full-Stack Learning Management System (LMS) designed to demonstrate enterprise-grade engineering principles.

This project showcases low-level database optimization, Zero-ORM native SQL architectures using `pg`, JWT Role-Based Access Control (RBAC), multi-tier API security, automated integration testing, and a modular React frontend.

🌐 **Live Demo Links:**
*   **Frontend (Vercel):** [https://coursehub-lms-eight.vercel.app](https://coursehub-lms-eight.vercel.app)
*   **Backend API (Render):** [https://coursehub-lms.onrender.com](https://coursehub-lms.onrender.com)

> [!NOTE]
> **Zero-ORM & High-Performance Design:** This codebase intentionally uses the native PostgreSQL client (`pg`) instead of heavy ORMs (like Prisma or Sequelize). This eliminates ORM translation overhead, prevents runtime cold-start penalties, gives granular control over execution plans (`EXPLAIN ANALYZE`), and provides sub-5ms query performance.

---

## 🚀 Key Features

### 👤 Authentication, Authorization & Security (RBAC)
*   **Stateless JWT Authentication:** Secure session management with role-based route guards.
*   **Role-Based Access Control (RBAC):**
    *   `ADMIN`: Complete platform governance, system metrics, user/course management, and manual student enrollment/disenrollment.
    *   `INSTRUCTOR`: Full course authoring studio, curriculum management, and editing/deleting courses and lessons.
    *   `STUDENT`: Browse catalog, enroll in courses, track lesson progress, write reviews, and redeem coupons.
*   **Security Hardening:**
    *   HTTP security headers powered by `helmet({ crossOriginResourcePolicy: false })`.
    *   Rate limiting on authentication routes (`/api/auth`) via `express-rate-limit` to thwart brute-force attempts.
    *   Password hashing with `bcryptjs`.
    *   Zero auth-flicker on hydration with `isInitializing` state guards.

### ⚡ Database Performance & Query Optimization
*   **12 B-Tree Indexes:** Covering all foreign keys (`user_id`, `course_id`, `instructor_id`, `category_id`) and high-frequency search/sorting columns (`status`, `created_at`, `price`).
*   **N+1 Query Elimination:** Subquery aggregation using native PostgreSQL `json_agg` for complex relational queries (`getMyCourses`, `myOrders`), retrieving entire relational hierarchies in a single database round-trip.
*   **Server & Client Pagination:** Backend endpoints (`/api/courses`, `/api/admin/*`) and frontend components support granular `page` and `limit` navigation.

### 📚 Interactive Learning Classroom
*   **Split-Screen Study Workspace:** Clean curriculum navigation sidebar on the right with the active video player and notes workspace on the left.
*   **Embedded Video Streaming:** Embedded YouTube player with lesson descriptions and attached resource links.
*   **URL-Synchronized Navigation:** Seamless deep-linking (`/my-courses?courseId=...&lessonId=...`) enabling native browser Back/Forward navigation.
*   **Real-time Progress Calculation:** Dynamic calculation of course completion percentage as lessons are completed.
*   **Student Feedback System:** Verified course reviews and rating breakdown.

### 🛠️ Instructor Studio
*   **Course Authoring:** Dynamic category assignment, custom thumbnails, and tuition pricing.
*   **Curriculum Builder:** Add, edit, reorder, and delete lesson modules.
*   **Lifecycle Management:** Edit course metadata or delete courses and lessons with integrated safety confirmations.

### 🛒 Cart & Synchronized Coupon System
*   Database-persisted shopping cart synchronized across user sessions.
*   Server-validated discount coupon engine (`COURSEHUB50` for 50% off, `WELCOME20` for 20% off) ensuring frontend and backend order total parity.
*   Duplicate enrollment prevention filtering during checkout.

### 📊 Modular Admin Dashboard
*   **Decomposed Tab Architecture:** Split into focused modular components:
    *   `AdminOverviewTab`: Key metric cards, revenue statistics, recent activity.
    *   `AdminUsersTab`: Filterable, sortable, and paginated user directory with role modification.
    *   `AdminCoursesTab`: Filterable, sortable, and paginated course management with status toggle.
    *   `AdminEnrollmentsTab`: Real-time student enrollment audit table with disenrollment capabilities.
    *   `AdminModals`: Add/edit user, course, and enrollment dialogs.

### 🌐 Bilingual Internationalization (EN 🇬🇧 / VI 🇻🇳)
*   **Zero-Dependency i18n Architecture:** Lightweight custom `LanguageContext` replacing heavy third-party translation libraries while delivering instant, zero-reload language switching.
*   **Complete Localization:** Full coverage across Home, Catalog, Course Detail, Learning Classroom, Shopping Cart, Instructor Studio, Admin Dashboard, and Authentication.
*   **Parameter Interpolation & Fallbacks:** Dynamic template replacement (`{count}`, `{year}`) with automatic English fallback resolution.
*   **HTML Lang Synchronization:** Auto-syncs `document.documentElement.lang` and persists user preferences in `localStorage`.
*   **Accessible Language Switcher:** Global `LanguageToggle` button in both desktop header and mobile responsive drawer.

---

## 🛠️ Tech Stack

| Layer | Technology | Key Highlights |
| :--- | :--- | :--- |
| **Backend API** | Node.js, Express.js 4 | Modular MVC structure, `asyncHandler` error encapsulation |
| **Database** | PostgreSQL (Supabase / Cloud) | B-Tree indexed schemas, relational integrity, `json_agg` subqueries |
| **Database Driver**| `pg` (node-postgres) | Native connection pool, raw SQL performance (Zero-ORM) |
| **Validation** | Zod | Schema-based payload validation formatted to structured HTTP 400 errors |
| **Security** | Helmet, express-rate-limit, Bcrypt | HTTP protection, brute-force mitigation, secure password hashing |
| **Frontend** | React 19, Vite | Fast HMR, responsive dark/light mode, custom design system |
| **Styling & Fonts** | Vanilla CSS | Standardized font pairing (Inter & JetBrains Mono), glassmorphism, responsive UI |
| **Internationalization** | Custom React `LanguageContext` | Zero-dependency, instantaneous EN/VI bilingual switching, `localStorage` synced |
| **Testing** | Node.js Native Test Runner (`node:test`) | Fast, dependency-free automated integration test suite |

---

## 🏗️ Architecture Model

```mermaid
graph TD
    Client[React 19 SPA<br/>Vite / Vercel]
    
    subgraph Express Backend
        Security[Helmet + Rate Limiter]
        Router[Express Routes]
        Async[AsyncHandler Wrapper]
        Zod[Zod Validation Schema]
        Controller[Controllers & Business Logic]
        ErrorMid[Error Middleware / Zod Formatter]
    end

    subgraph PostgreSQL Database
        Pool[pg Connection Pool]
        Indexes[12 B-Tree Indexes]
        Tables[(Tables: users, courses, lessons, orders, enrollments)]
    end

    Client -->|HTTPS REST API| Security
    Security --> Router
    Router --> Async
    Async --> Zod
    Zod --> Controller
    Controller --> ErrorMid
    Controller -->|Native SQL Query / json_agg| Pool
    Pool --> Indexes
    Indexes --> Tables
    Tables -->|Result Set| Pool
    Pool -->|Data| Controller
    Controller -->|JSON Response| Client
```

---

## 📂 Directory Structure

```text
coursehub/
├── backend/
│   ├── sql/
│   │   └── schema.sql              # Database schema with 12 B-Tree indexes
│   ├── scripts/
│   │   ├── init-db.js             # DDL execution script
│   │   └── seed.js                # Database seeding script (roles, courses, lessons)
│   ├── src/
│   │   ├── controllers/           # Business logic (admin, auth, course, cart, order)
│   │   ├── middlewares/           # JWT auth, Zod & PostgreSQL error handler
│   │   ├── routes/                # Express routes (auth, course, cart, order, admin)
│   │   ├── utils/                 # asyncHandler, token helpers
│   │   ├── db.js                  # pg Connection pool
│   │   └── server.js              # Express entrypoint with Helmet & Rate Limiter
│   ├── tests/
│   │   └── api.test.js            # Automated integration test suite
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                   # Fetch-based API client with auth interceptor
│   │   ├── components/            # Reusable UI (Pagination, CourseCard, ProtectedRoute)
│   │   ├── context/               # AuthContext with isInitializing state
│   │   ├── pages/
│   │   │   ├── admin/             # Modular admin tabs (Overview, Users, Courses, etc.)
│   │   │   ├── Admin.jsx          # Admin container layout
│   │   │   ├── Cart.jsx           # Shopping cart & coupon checkout
│   │   │   ├── CourseDetail.jsx   # Course syllabus preview & review submission
│   │   │   ├── Home.jsx           # Editorial hero, bento tracks, paginated catalog
│   │   │   ├── Instructor.jsx     # Instructor studio (CRUD courses & lessons)
│   │   │   ├── Login.jsx          # Login view
│   │   │   ├── MyCourses.jsx      # Classroom video workspace
│   │   │   └── Register.jsx       # Student registration view
│   │   ├── App.jsx                # Router & theme management
│   │   └── style.css              # Custom responsive vanilla CSS design system
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
*   **Node.js** (v18.x or higher)
*   **PostgreSQL** instance (Supabase, local Postgres, or Render)

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
3. Set up environment variables:
   * Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   * Configure your database credentials and secrets:
     ```env
     DATABASE_URL=postgresql://your_user:your_password@your_host:5432/your_db
     JWT_SECRET=your_super_secure_jwt_secret_key
     PORT=5000
     CLIENT_URL=http://localhost:5173
     ```
4. Initialize the database schema and seed mock data:
   ```bash
   npm run db:init
   npm run seed
   ```
5. Run the automated test suite:
   ```bash
   npm run test
   ```
6. Start the development server:
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
   * Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   * Ensure the API URL points to your backend:
     ```env
     VITE_API_URL=http://localhost:5000/api
     ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will run on:* `http://localhost:5173`

5. Verify production build:
   ```bash
   npm run build
   ```

---

## 🧪 Automated Testing

The backend includes a comprehensive test suite written with Node's native test runner (`node:test`):

```bash
cd backend
npm run test
```

### Coverage Highlights:
*   `GET /`: Health check verification
*   `Security headers`: Verification of Helmet HTTP protection
*   `GET /api/courses`: Active courses listing & pagination query handling
*   `GET /api/courses/categories`: Public category track listing
*   `POST /api/auth/register`: Structured Zod validation errors on invalid input (HTTP 400)
*   `POST /api/auth/register` & `login`: Full account creation & JWT authentication flow
*   `GET /api/courses/mine`: Protected endpoint authentication barrier (HTTP 401)

---

## 🔑 Demo Accounts

Use these pre-seeded accounts to explore the role-based features:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `123456` | Platform metrics, manage all users/courses/enrollments |
| **Instructor** | `teacher@example.com` | `123456` | Instructor Studio: Create, edit, and delete courses & lessons |
| **Student** | `student@example.com` | `123456` | Course enrollment, classroom video player, coupon checkout, reviews |

---

## 🎟️ Demo Promotional Coupons

Test the checkout discount engine in the Cart using these codes:
*   `COURSEHUB50`: **50% OFF** entire order
*   `WELCOME20`: **20% OFF** entire order

---

## 📝 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
