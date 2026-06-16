import { z } from "zod";
import { query } from "../db.js";

const courseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().int().min(0),
  thumbnailUrl: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "BLOCKED"]).optional(),
});

const lessonSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(3),
  order: z.coerce.number().int().min(1).optional(),
  isPreview: z.boolean().optional(),
});

function courseFromRow(row) {
  return {
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
    instructor: row.instructor_id ? { id: row.instructor_id, name: row.instructor_name } : null,
    category: row.category_id ? { id: row.category_id, name: row.category_name } : null,
    averageRating: Number(row.average_rating || 0),
  };
}

function lessonFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    order: row.lesson_order,
    isPreview: row.is_preview,
    courseId: row.course_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCourses(req, res) {
  const { q, category } = req.query;
  const params = [];
  let where = "c.status = 'PUBLISHED'";

  if (q) {
    params.push(`%${q}%`);
    where += ` AND c.title ILIKE $${params.length}`;
  }
  if (category) {
    params.push(String(category));
    where += ` AND c.category_id = $${params.length}`;
  }

  const result = await query(
    `SELECT c.*, u.name AS instructor_name, cat.name AS category_name,
            COALESCE(AVG(r.rating), 0) AS average_rating
     FROM courses c
     JOIN users u ON u.id = c.instructor_id
     LEFT JOIN categories cat ON cat.id = c.category_id
     LEFT JOIN reviews r ON r.course_id = c.id
     WHERE ${where}
     GROUP BY c.id, u.name, cat.name
     ORDER BY c.created_at DESC`,
    params
  );

  res.json(result.rows.map(courseFromRow));
}

export async function getCourse(req, res) {
  const courseResult = await query(
    `SELECT c.*, u.name AS instructor_name, cat.name AS category_name,
            COALESCE(AVG(r.rating), 0) AS average_rating
     FROM courses c
     JOIN users u ON u.id = c.instructor_id
     LEFT JOIN categories cat ON cat.id = c.category_id
     LEFT JOIN reviews r ON r.course_id = c.id
     WHERE c.id = $1
     GROUP BY c.id, u.name, cat.name`,
    [req.params.id]
  );
  const row = courseResult.rows[0];
  if (!row) return res.status(404).json({ message: "Course not found" });

  const lessonsResult = await query("SELECT * FROM lessons WHERE course_id = $1 ORDER BY lesson_order ASC", [req.params.id]);
  const reviewsResult = await query(
    `SELECT r.*, u.id AS user_id, u.name AS user_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.course_id = $1
     ORDER BY r.created_at DESC`,
    [req.params.id]
  );

  res.json({
    ...courseFromRow(row),
    lessons: lessonsResult.rows.map(lessonFromRow),
    reviews: reviewsResult.rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      userId: r.user_id,
      courseId: r.course_id,
      createdAt: r.created_at,
      user: { id: r.user_id, name: r.user_name },
    })),
  });
}

export async function createCourse(req, res) {
  const data = courseSchema.parse(req.body);
  const result = await query(
    `INSERT INTO courses (title, description, price, thumbnail_url, status, instructor_id, category_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [data.title, data.description, data.price, data.thumbnailUrl || null, data.status || "DRAFT", req.user.id, data.categoryId || null]
  );
  res.status(201).json(courseFromRow(result.rows[0]));
}

export async function updateCourse(req, res) {
  const data = courseSchema.partial().parse(req.body);
  const existing = await query("SELECT * FROM courses WHERE id = $1", [req.params.id]);
  const course = existing.rows[0];
  if (!course) return res.status(404).json({ message: "Course not found" });
  if (req.user.role !== "ADMIN" && course.instructor_id !== req.user.id) return res.status(403).json({ message: "Forbidden" });

  const updated = await query(
    `UPDATE courses SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       price = COALESCE($3, price),
       thumbnail_url = COALESCE($4, thumbnail_url),
       status = COALESCE($5, status),
       category_id = COALESCE($6, category_id),
       updated_at = now()
     WHERE id = $7 RETURNING *`,
    [data.title, data.description, data.price, data.thumbnailUrl, data.status, data.categoryId, req.params.id]
  );
  res.json(courseFromRow(updated.rows[0]));
}

export async function createLesson(req, res) {
  const data = lessonSchema.parse(req.body);
  const existing = await query("SELECT * FROM courses WHERE id = $1", [req.params.id]);
  const course = existing.rows[0];
  if (!course) return res.status(404).json({ message: "Course not found" });
  if (req.user.role !== "ADMIN" && course.instructor_id !== req.user.id) return res.status(403).json({ message: "Forbidden" });

  const result = await query(
    `INSERT INTO lessons (title, content, lesson_order, is_preview, course_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.title, data.content, data.order || 1, data.isPreview || false, course.id]
  );
  res.status(201).json(lessonFromRow(result.rows[0]));
}

export async function markLessonCompleted(req, res) {
  const lessonResult = await query("SELECT * FROM lessons WHERE id = $1", [req.params.lessonId]);
  const lesson = lessonResult.rows[0];
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });

  const enrollment = await query("SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2", [req.user.id, lesson.course_id]);
  if (!enrollment.rowCount) return res.status(403).json({ message: "You are not enrolled in this course" });

  const result = await query(
    `INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at)
     VALUES ($1, $2, true, now())
     ON CONFLICT (user_id, lesson_id)
     DO UPDATE SET completed = true, completed_at = now(), updated_at = now()
     RETURNING *`,
    [req.user.id, lesson.id]
  );
  res.json(result.rows[0]);
}

export async function markLessonIncomplete(req, res) {
  const lessonResult = await query("SELECT * FROM lessons WHERE id = $1", [req.params.lessonId]);
  const lesson = lessonResult.rows[0];
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });

  const enrollment = await query("SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2", [req.user.id, lesson.course_id]);
  if (!enrollment.rowCount) return res.status(403).json({ message: "You are not enrolled in this course" });

  const result = await query(
    `INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at)
     VALUES ($1, $2, false, null)
     ON CONFLICT (user_id, lesson_id)
     DO UPDATE SET completed = false, completed_at = null, updated_at = now()
     RETURNING *`,
    [req.user.id, lesson.id]
  );
  res.json(result.rows[0]);
}


export async function reviewCourse(req, res) {
  const schema = z.object({ rating: z.coerce.number().int().min(1).max(5), comment: z.string().optional() });
  const data = schema.parse(req.body);

  const enrollment = await query("SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2", [req.user.id, req.params.id]);
  if (!enrollment.rowCount) return res.status(403).json({ message: "Only enrolled students can review" });

  const result = await query(
    `INSERT INTO reviews (rating, comment, user_id, course_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, course_id)
     DO UPDATE SET rating = $1, comment = $2, updated_at = now()
     RETURNING *`,
    [data.rating, data.comment || null, req.user.id, req.params.id]
  );
  res.json(result.rows[0]);
}

export async function getMyCourses(req, res) {
  const enrollments = await query(
    `SELECT e.*, c.title, c.description, c.price, c.thumbnail_url, c.status
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     WHERE e.user_id = $1
     ORDER BY e.created_at DESC`,
    [req.user.id]
  );

  const result = [];
  for (const row of enrollments.rows) {
    const lessons = await query(
      `SELECT l.*, COALESCE(lp.completed, false) as completed
       FROM lessons l
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = $2
       WHERE l.course_id = $1
       ORDER BY l.lesson_order ASC`,
      [row.course_id, req.user.id]
    );
    result.push({
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      createdAt: row.created_at,
      course: {
        id: row.course_id,
        title: row.title,
        description: row.description,
        price: row.price,
        thumbnailUrl: row.thumbnail_url,
        status: row.status,
        lessons: lessons.rows.map((l) => ({
          ...lessonFromRow(l),
          completed: l.completed,
        })),
      },
    });
  }
  res.json(result);
}
