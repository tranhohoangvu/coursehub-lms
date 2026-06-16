import bcrypt from "bcryptjs";
import { pool, query } from "../src/db.js";

const password = await bcrypt.hash("123456", 10);

async function upsertUser(name, email, role) {
  const result = await query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email)
     DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role
     RETURNING *`,
    [name, email, password, role]
  );
  return result.rows[0];
}

async function upsertCategory(name) {
  const result = await query(
    `INSERT INTO categories (name)
     VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING *`,
    [name]
  );
  return result.rows[0];
}

const admin = await upsertUser("Admin User", "admin@example.com", "ADMIN");
const teacher = await upsertUser("Teacher Demo", "teacher@example.com", "INSTRUCTOR");
const student = await upsertUser("Student Demo", "student@example.com", "STUDENT");

const backend = await upsertCategory("Backend Development");
const frontend = await upsertCategory("Frontend Development");
const softeng = await upsertCategory("Software Engineering");
const dbmgmt = await upsertCategory("Database Management");

async function createCourse({ title, description, price, categoryId, thumbnailUrl }) {
  const existing = await query("SELECT * FROM courses WHERE title = $1", [title]);
  if (existing.rowCount) {
    const updated = await query(
      `UPDATE courses 
       SET description = $1, price = $2, thumbnail_url = $3, category_id = $4, updated_at = now()
       WHERE title = $5 RETURNING *`,
      [description, price, thumbnailUrl, categoryId, title]
    );
    return updated.rows[0];
  }

  const result = await query(
    `INSERT INTO courses (title, description, price, thumbnail_url, status, instructor_id, category_id)
     VALUES ($1, $2, $3, $4, 'PUBLISHED', $5, $6)
     RETURNING *`,
    [title, description, price, thumbnailUrl, teacher.id, categoryId]
  );
  return result.rows[0];
}

async function createLesson(courseId, title, content, order, isPreview = false, videoUrl = null, resourceUrl = null) {
  const existing = await query("SELECT id FROM lessons WHERE course_id = $1 AND lesson_order = $2", [courseId, order]);
  if (existing.rowCount) {
    await query(
      `UPDATE lessons 
       SET title = $1, content = $2, is_preview = $3, video_url = $4, resource_url = $5 
       WHERE course_id = $6 AND lesson_order = $7`,
      [title, content, isPreview, videoUrl, resourceUrl, courseId, order]
    );
    return;
  }
  await query(
    `INSERT INTO lessons (course_id, title, content, lesson_order, is_preview, video_url, resource_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [courseId, title, content, order, isPreview, videoUrl, resourceUrl]
  );
}

// -----------------------------------------------------------------------------
// COURSE 1: REST API with Express.js
// -----------------------------------------------------------------------------
const apiCourse = await createCourse({
  title: "REST API with Express.js & Node",
  description: "Build robust, production-style REST APIs using Node.js, Express.js, JWT authentication, PostgreSQL, and clean architecture.",
  price: 499000,
  categoryId: backend.id,
  thumbnailUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900",
});

await createLesson(
  apiCourse.id,
  "Express.js Project Setup & Basics",
  "In this lesson, we will initialize our Node.js application, install the required dependencies (Express, dotenv, nodemon), configure our project structure, and write our first Express server route.",
  1,
  true,
  "https://www.youtube.com/watch?v=yEHCfGvPA-g",
  "https://raw.githubusercontent.com/expressjs/express/master/Readme.md"
);

await createLesson(
  apiCourse.id,
  "JWT Authentication & Custom Middlewares",
  "Learn how to create registration and login workflows using bcryptjs for secure password hashing and jsonwebtoken (JWT) to sign stateless tokens. We will also write custom auth middlewares to protect private endpoints and restrict actions based on roles (ADMIN, INSTRUCTOR, STUDENT).",
  2,
  false,
  "https://www.youtube.com/watch?v=mbsmsi7l3r4",
  "https://jwt.io/introduction"
);

await createLesson(
  apiCourse.id,
  "Database Operations with PostgreSQL Native pg Client",
  "Connect your Node.js application to a cloud-based PostgreSQL database (Supabase) using the native pg client. Learn how to configure a connection pool, execute safe parameterized SQL queries, handle SQL injection, and manage database connection lifecycles.",
  3,
  false,
  "https://www.youtube.com/watch?v=W-8yvU33yW8",
  "https://node-postgres.com/"
);


// -----------------------------------------------------------------------------
// COURSE 2: React Portfolio Frontend
// -----------------------------------------------------------------------------
const reactCourse = await createCourse({
  title: "React Portfolio Frontend with Vite",
  description: "Create a modern, high-performance React frontend application using Vite, featuring React Router v6, Tailwind CSS, API calls, and context state management.",
  price: 399000,
  categoryId: frontend.id,
  thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900",
});

await createLesson(
  reactCourse.id,
  "Routing with React Router v6",
  "Understand how to build single page app (SPA) routing. We cover nested routes, shared layout layouts, route protection, and dynamic path parameters using useParams and useNavigate.",
  1,
  true,
  "https://www.youtube.com/watch?v=OMQ2PkJaJnE",
  "https://reactrouter.com/en/main"
);

await createLesson(
  reactCourse.id,
  "State Management with Context API",
  "Learn how to build global state providers (such as AuthContext) using React Context API. We will implement global user state management, custom hooks, and dynamic navigation state rendering.",
  2,
  false,
  "https://www.youtube.com/watch?v=5LrDIWddDKU",
  "https://react.dev/reference/react/createContext"
);


// -----------------------------------------------------------------------------
// COURSE 3: Mastering Git & GitHub for Developers
// -----------------------------------------------------------------------------
const gitCourse = await createCourse({
  title: "Mastering Git & GitHub for Developers",
  description: "Gain complete mastery over Git and GitHub. Learn professional branching workflows, conflict resolution, rebase, pull requests, and Git hooks.",
  price: 199000,
  categoryId: softeng.id,
  thumbnailUrl: "/git_github_course.png",
});

await createLesson(
  gitCourse.id,
  "Git Essentials & Local Commits",
  "Learn the foundational mechanisms of Git. This lesson teaches you how Git manages changes in staging, the commit history tree, using .gitignore effectively, and navigating logs.",
  1,
  true,
  "https://www.youtube.com/watch?v=RGOj5yH7evk",
  "https://git-scm.com/doc"
);

await createLesson(
  gitCourse.id,
  "Branching, Merging & Pull Requests",
  "Explore how to work in teams. We discuss Git branching strategy, how to perform fast-forward and recursive merges, resolving merge conflicts, and creating beautiful pull requests on GitHub.",
  2,
  false,
  "https://www.youtube.com/watch?v=Uszj_k0DGsg",
  "https://docs.github.com/en"
);


// -----------------------------------------------------------------------------
// COURSE 4: Practical PostgreSQL Database Design
// -----------------------------------------------------------------------------
const pgCourse = await createCourse({
  title: "Practical PostgreSQL Database Design",
  description: "Learn how to build optimal relational schemas in PostgreSQL. Covers normalization, primary/foreign keys, indexes, transactions, and performance query tuning.",
  price: 299000,
  categoryId: dbmgmt.id,
  thumbnailUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=900",
});

await createLesson(
  pgCourse.id,
  "Conceptual Database Modeling & Schema Design",
  "Learn the basics of relational entity modeling. We will cover 1-to-many, many-to-many relationships, database constraints (NOT NULL, UNIQUE, CHECK), and writing schema migration scripts.",
  1,
  true,
  "https://www.youtube.com/watch?v=K6w0bZjl_Lg",
  "https://www.postgresql.org/docs/current/ddl.html"
);

await createLesson(
  pgCourse.id,
  "PostgreSQL Query Optimization & Indexing",
  "Master indices (B-Tree, Hash, GIN) to speed up search queries, write advanced JOIN queries, analyze query execution plans using EXPLAIN ANALYZE, and build secure database transactions.",
  2,
  false,
  "https://www.youtube.com/watch?v=7zGgT-N_l8o",
  "https://www.postgresql.org/docs/current/indexes.html"
);


// -----------------------------------------------------------------------------
// ENROLLMENT & FINISHING SEED
// -----------------------------------------------------------------------------
await query(
  `INSERT INTO enrollments (user_id, course_id)
   VALUES ($1, $2), ($1, $3), ($1, $4)
   ON CONFLICT (user_id, course_id) DO NOTHING`,
  [student.id, apiCourse.id, reactCourse.id, gitCourse.id]
);

console.log("Seed completed.");
console.log("Accounts:");
console.log("admin@example.com / 123456");
console.log("teacher@example.com / 123456");
console.log("student@example.com / 123456");
await pool.end();
