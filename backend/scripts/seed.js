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

async function createCourse({ title, description, price, categoryId, thumbnailUrl }) {
  const existing = await query("SELECT * FROM courses WHERE title = $1", [title]);
  if (existing.rowCount) return existing.rows[0];

  const result = await query(
    `INSERT INTO courses (title, description, price, thumbnail_url, status, instructor_id, category_id)
     VALUES ($1, $2, $3, $4, 'PUBLISHED', $5, $6)
     RETURNING *`,
    [title, description, price, thumbnailUrl, teacher.id, categoryId]
  );
  return result.rows[0];
}

async function createLesson(courseId, title, content, order, isPreview = false) {
  const existing = await query("SELECT id FROM lessons WHERE course_id = $1 AND lesson_order = $2", [courseId, order]);
  if (existing.rowCount) return;
  await query(
    `INSERT INTO lessons (course_id, title, content, lesson_order, is_preview)
     VALUES ($1, $2, $3, $4, $5)`,
    [courseId, title, content, order, isPreview]
  );
}

const apiCourse = await createCourse({
  title: "REST API with Express.js",
  description: "Build production-style REST APIs using Express.js, JWT authentication, PostgreSQL, validation and clean project structure.",
  price: 499000,
  categoryId: backend.id,
  thumbnailUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900",
});
await createLesson(apiCourse.id, "Project setup", "Initialize Node.js, Express and folder structure.", 1, true);
await createLesson(apiCourse.id, "Authentication", "Implement register, login, JWT middleware and role-based access control.", 2);
await createLesson(apiCourse.id, "Database workflow", "Design tables and connect PostgreSQL with the pg driver.", 3);

const reactCourse = await createCourse({
  title: "React Portfolio Frontend",
  description: "Create a clean React frontend for a deployed portfolio project with routing, API calls and reusable components.",
  price: 399000,
  categoryId: frontend.id,
  thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900",
});
await createLesson(reactCourse.id, "React Router", "Set up pages and nested layout routes.", 1, true);
await createLesson(reactCourse.id, "API client", "Create a reusable fetch wrapper with authorization headers.", 2);

await query(
  `INSERT INTO enrollments (user_id, course_id)
   VALUES ($1, $2)
   ON CONFLICT (user_id, course_id) DO NOTHING`,
  [student.id, apiCourse.id]
);

console.log("Seed completed.");
console.log("Accounts:");
console.log("admin@example.com / 123456");
console.log("teacher@example.com / 123456");
console.log("student@example.com / 123456");
await pool.end();
