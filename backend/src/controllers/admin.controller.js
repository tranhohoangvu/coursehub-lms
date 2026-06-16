import bcrypt from "bcryptjs";
import { z } from "zod";
import { query } from "../db.js";

const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "INSTRUCTOR", "STUDENT"]).optional(),
  password: z.string().min(6).optional(),
});

export async function dashboard(req, res) {
  const [users, courses, orders, revenue] = await Promise.all([
    query("SELECT COUNT(*)::int AS count FROM users"),
    query("SELECT COUNT(*)::int AS count FROM courses"),
    query("SELECT COUNT(*)::int AS count FROM orders WHERE status = 'PAID'"),
    query("SELECT COALESCE(SUM(total), 0)::int AS total FROM orders WHERE status = 'PAID'"),
  ]);

  res.json({
    totalUsers: users.rows[0].count,
    totalCourses: courses.rows[0].count,
    paidOrders: orders.rows[0].count,
    revenue: revenue.rows[0].total,
  });
}

export async function listUsers(req, res) {
  const users = await query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
  res.json(users.rows.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.created_at })));
}

export async function updateUser(req, res) {
  const data = userUpdateSchema.parse(req.body);
  const userResult = await query("SELECT * FROM users WHERE id = $1", [req.params.id]);
  const user = userResult.rows[0];
  if (!user) return res.status(404).json({ message: "User not found" });

  if (data.role && data.role !== user.role) {
    if (data.role === "ADMIN") {
      return res.status(400).json({ message: "Cannot assign ADMIN role to users. There must only be one admin in the system." });
    }
    if (user.role === "ADMIN") {
      return res.status(400).json({ message: "Cannot change the role of the ADMIN user." });
    }
  }

  if (data.email && data.email !== user.email) {
    const existing = await query("SELECT id FROM users WHERE email = $1", [data.email]);
    if (existing.rowCount) return res.status(409).json({ message: "Email already exists" });
  }

  let passwordHash = user.password;
  if (data.password) {
    passwordHash = await bcrypt.hash(data.password, 10);
  }

  const result = await query(
    `UPDATE users SET
       name = COALESCE($1, name),
       email = COALESCE($2, email),
       role = COALESCE($3, role),
       password = $4,
       updated_at = now()
     WHERE id = $5 RETURNING id, name, email, role, created_at`,
    [data.name, data.email, data.role, passwordHash, req.params.id]
  );
  res.json({ id: result.rows[0].id, name: result.rows[0].name, email: result.rows[0].email, role: result.rows[0].role, createdAt: result.rows[0].created_at });
}

export async function deleteUser(req, res) {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: "You cannot delete yourself" });
  }
  const existing = await query("SELECT * FROM users WHERE id = $1", [req.params.id]);
  if (!existing.rowCount) return res.status(404).json({ message: "User not found" });

  await query("DELETE FROM users WHERE id = $1", [req.params.id]);
  res.json({ message: "User deleted successfully" });
}

export async function listAllCourses(req, res) {
  const result = await query(
    `SELECT c.*, u.name AS instructor_name, cat.name AS category_name,
            COALESCE(AVG(r.rating), 0) AS average_rating
     FROM courses c
     LEFT JOIN users u ON u.id = c.instructor_id
     LEFT JOIN categories cat ON cat.id = c.category_id
     LEFT JOIN reviews r ON r.course_id = c.id
     GROUP BY c.id, u.name, cat.name
     ORDER BY c.created_at DESC`
  );

  res.json(
    result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      price: row.price,
      thumbnailUrl: row.thumbnail_url,
      status: row.status,
      instructorId: row.instructor_id,
      categoryId: row.category_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      instructorName: row.instructor_name,
      categoryName: row.category_name,
      averageRating: Number(row.average_rating || 0),
    }))
  );
}

export async function updateCourseStatus(req, res) {
  const { status } = req.body;
  if (!["DRAFT", "PUBLISHED", "BLOCKED"].includes(status)) return res.status(400).json({ message: "Invalid status" });
  const result = await query("UPDATE courses SET status = $1, updated_at = now() WHERE id = $2 RETURNING *", [status, req.params.id]);
  if (!result.rowCount) return res.status(404).json({ message: "Course not found" });
  res.json(result.rows[0]);
}

export async function deleteCourse(req, res) {
  const existing = await query("SELECT * FROM courses WHERE id = $1", [req.params.id]);
  if (!existing.rowCount) return res.status(404).json({ message: "Course not found" });

  await query("DELETE FROM courses WHERE id = $1", [req.params.id]);
  res.json({ message: "Course deleted successfully" });
}

export async function listEnrollments(req, res) {
  const result = await query(
    `SELECT e.id, e.user_id, e.course_id, e.created_at,
            u.name AS user_name, u.email AS user_email,
            c.title AS course_title
     FROM enrollments e
     JOIN users u ON u.id = e.user_id
     JOIN courses c ON c.id = e.course_id
     ORDER BY e.created_at DESC`
  );

  res.json(
    result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      createdAt: row.created_at,
      userName: row.user_name,
      userEmail: row.user_email,
      courseTitle: row.course_title,
    }))
  );
}

export async function createEnrollment(req, res) {
  const schema = z.object({
    userId: z.string().uuid(),
    courseId: z.string().uuid(),
  });

  const { userId, courseId } = schema.parse(req.body);

  const userResult = await query("SELECT id FROM users WHERE id = $1", [userId]);
  if (!userResult.rowCount) return res.status(404).json({ message: "User not found" });

  const courseResult = await query("SELECT id FROM courses WHERE id = $1", [courseId]);
  if (!courseResult.rowCount) return res.status(404).json({ message: "Course not found" });

  const existing = await query("SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2", [userId, courseId]);
  if (existing.rowCount) return res.status(409).json({ message: "Student is already enrolled in this course" });

  const result = await query(
    `INSERT INTO enrollments (user_id, course_id)
     VALUES ($1, $2)
     RETURNING *`,
    [userId, courseId]
  );
  res.status(201).json(result.rows[0]);
}

export async function deleteEnrollment(req, res) {
  const result = await query("DELETE FROM enrollments WHERE id = $1 RETURNING *", [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ message: "Enrollment not found" });
  res.json({ message: "Enrollment deleted successfully" });
}

export async function listCategories(req, res) {
  const result = await query("SELECT id, name FROM categories ORDER BY name ASC");
  res.json(result.rows);
}

export async function createUser(req, res) {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    role: z.enum(["INSTRUCTOR", "STUDENT"]).optional().default("STUDENT"),
    password: z.string().min(6),
  });

  const data = schema.parse(req.body);
  const existing = await query("SELECT id FROM users WHERE email = $1", [data.email]);
  if (existing.rowCount) return res.status(409).json({ message: "Email already exists" });

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const result = await query(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [data.name, data.email, hashedPassword, data.role]
  );
  res.status(201).json({ id: result.rows[0].id, name: result.rows[0].name, email: result.rows[0].email, role: result.rows[0].role, createdAt: result.rows[0].created_at });
}

export async function adminCreateCourse(req, res) {
  const schema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    price: z.coerce.number().int().min(0),
    thumbnailUrl: z.string().optional().nullable(),
    status: z.enum(["DRAFT", "PUBLISHED", "BLOCKED"]).optional().default("DRAFT"),
    instructorId: z.string().uuid(),
    categoryId: z.string().uuid().optional().nullable(),
  });

  const data = schema.parse(req.body);
  const instructorResult = await query("SELECT id, role FROM users WHERE id = $1", [data.instructorId]);
  if (!instructorResult.rowCount) return res.status(404).json({ message: "Instructor not found" });

  const result = await query(
    `INSERT INTO courses (title, description, price, thumbnail_url, status, instructor_id, category_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.title,
      data.description,
      data.price,
      data.thumbnailUrl || null,
      data.status,
      data.instructorId,
      data.categoryId || null
    ]
  );

  const courseResult = await query(
    `SELECT c.*, u.name AS instructor_name, cat.name AS category_name
     FROM courses c
     LEFT JOIN users u ON u.id = c.instructor_id
     LEFT JOIN categories cat ON cat.id = c.category_id
     WHERE c.id = $1`,
    [result.rows[0].id]
  );

  res.status(201).json({
    id: courseResult.rows[0].id,
    title: courseResult.rows[0].title,
    description: courseResult.rows[0].description,
    price: courseResult.rows[0].price,
    thumbnailUrl: courseResult.rows[0].thumbnail_url,
    status: courseResult.rows[0].status,
    instructorId: courseResult.rows[0].instructor_id,
    categoryId: courseResult.rows[0].category_id,
    createdAt: courseResult.rows[0].created_at,
    updatedAt: courseResult.rows[0].updated_at,
    instructorName: courseResult.rows[0].instructor_name,
    categoryName: courseResult.rows[0].category_name,
    averageRating: 0,
  });
}

export async function listInstructors(req, res) {
  const result = await query("SELECT id, name, email FROM users WHERE role IN ('INSTRUCTOR', 'ADMIN') ORDER BY name ASC");
  res.json(result.rows);
}
