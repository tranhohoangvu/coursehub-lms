import { query } from "../db.js";

async function getOrCreateCart(userId) {
  const result = await query(
    `INSERT INTO carts (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
     RETURNING *`,
    [userId]
  );
  return result.rows[0];
}

function courseFromRow(row) {
  return {
    id: row.course_id,
    title: row.title,
    description: row.description,
    price: row.price,
    thumbnailUrl: row.thumbnail_url,
    status: row.status,
  };
}

export async function getCart(req, res) {
  const cart = await getOrCreateCart(req.user.id);
  const items = await query(
    `SELECT ci.*, c.title, c.description, c.price, c.thumbnail_url, c.status
     FROM cart_items ci
     JOIN courses c ON c.id = ci.course_id
     WHERE ci.cart_id = $1
     ORDER BY ci.created_at DESC`,
    [cart.id]
  );

  res.json({
    id: cart.id,
    userId: cart.user_id,
    createdAt: cart.created_at,
    updatedAt: cart.updated_at,
    items: items.rows.map((row) => ({
      id: row.id,
      cartId: row.cart_id,
      courseId: row.course_id,
      createdAt: row.created_at,
      course: courseFromRow(row),
    })),
  });
}

export async function addToCart(req, res) {
  const { courseId } = req.body;
  const course = await query("SELECT id FROM courses WHERE id = $1 AND status = 'PUBLISHED'", [courseId]);
  if (!course.rowCount) return res.status(404).json({ message: "Course not found" });

  const enrollment = await query("SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2", [req.user.id, courseId]);
  if (enrollment.rowCount) return res.status(400).json({ message: "You already own this course" });

  const cart = await getOrCreateCart(req.user.id);
  const item = await query(
    `INSERT INTO cart_items (cart_id, course_id)
     VALUES ($1, $2)
     ON CONFLICT (cart_id, course_id) DO UPDATE SET course_id = EXCLUDED.course_id
     RETURNING *`,
    [cart.id, courseId]
  );

  res.status(201).json(item.rows[0]);
}

export async function removeFromCart(req, res) {
  const cart = await getOrCreateCart(req.user.id);
  await query("DELETE FROM cart_items WHERE cart_id = $1 AND course_id = $2", [cart.id, req.params.courseId]);
  res.json({ message: "Removed from cart" });
}
