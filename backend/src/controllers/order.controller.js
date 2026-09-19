import { query, transaction } from "../db.js";

export async function checkout(req, res) {
  const { couponCode } = req.body || {};

  const cartResult = await query("SELECT * FROM carts WHERE user_id = $1", [req.user.id]);
  const cart = cartResult.rows[0];
  if (!cart) return res.status(400).json({ message: "Cart is empty" });

  const itemsResult = await query(
    `SELECT ci.course_id, c.title, c.price, c.status
     FROM cart_items ci
     JOIN courses c ON c.id = ci.course_id
     WHERE ci.cart_id = $1`,
    [cart.id]
  );
  let items = itemsResult.rows;
  if (!items.length) return res.status(400).json({ message: "Cart is empty" });

  // Filter out any courses that student already owns
  const ownedResult = await query(
    "SELECT course_id FROM enrollments WHERE user_id = $1 AND course_id = ANY($2)",
    [req.user.id, items.map((i) => i.course_id)]
  );
  const ownedCourseIds = new Set(ownedResult.rows.map((r) => r.course_id));

  // If any already owned, remove them from cart
  if (ownedCourseIds.size > 0) {
    await query(
      "DELETE FROM cart_items WHERE cart_id = $1 AND course_id = ANY($2)",
      [cart.id, Array.from(ownedCourseIds)]
    );
    items = items.filter((item) => !ownedCourseIds.has(item.course_id));
    if (!items.length) {
      return res.status(400).json({
        message: "You already own all the courses in your cart. Cart has been updated.",
      });
    }
  }

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  // Apply discount coupon if valid
  let discountPercent = 0;
  if (couponCode) {
    const code = String(couponCode).toUpperCase().trim();
    if (code === "DISCOUNT50" || code === "COURSEHUB") {
      discountPercent = 50;
    } else if (code.length > 0) {
      discountPercent = 20;
    }
  }

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal - discountAmount);

  const order = await transaction(async (client) => {
    const orderResult = await client.query(
      "INSERT INTO orders (user_id, total, status) VALUES ($1, $2, 'PAID') RETURNING *",
      [req.user.id, total]
    );
    const createdOrder = orderResult.rows[0];

    for (const item of items) {
      // Calculate item price after proportional discount
      const itemFinalPrice = discountPercent > 0 
        ? Math.round(item.price * (1 - discountPercent / 100))
        : item.price;

      await client.query(
        "INSERT INTO order_items (order_id, course_id, price) VALUES ($1, $2, $3)",
        [createdOrder.id, item.course_id, itemFinalPrice]
      );
      await client.query(
        `INSERT INTO enrollments (user_id, course_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, course_id) DO NOTHING`,
        [req.user.id, item.course_id]
      );
    }

    const payment = await client.query(
      "INSERT INTO payments (order_id, provider, status) VALUES ($1, 'MOCK', 'SUCCESS') RETURNING *",
      [createdOrder.id]
    );
    await client.query("DELETE FROM cart_items WHERE cart_id = $1", [cart.id]);

    return {
      ...createdOrder,
      subtotal,
      discount: discountAmount,
      discountPercent,
      items,
      payment: payment.rows[0],
    };
  });

  res.status(201).json(order);
}

// -----------------------------------------------------------------------------
// MY ORDERS - Single Query with json_agg (Eliminates N+1 Query)
// -----------------------------------------------------------------------------
export async function myOrders(req, res) {
  const result = await query(
    `SELECT 
       o.id,
       o.user_id,
       o.total,
       o.status,
       o.created_at,
       (
         SELECT json_build_object(
           'id', p.id,
           'orderId', p.order_id,
           'provider', p.provider,
           'status', p.status,
           'createdAt', p.created_at
         )
         FROM payments p
         WHERE p.order_id = o.id
         LIMIT 1
       ) AS payment,
       COALESCE(
         (
           SELECT json_agg(
             json_build_object(
               'id', oi.id,
               'orderId', oi.order_id,
               'courseId', oi.course_id,
               'price', oi.price,
               'course', json_build_object(
                 'id', c.id,
                 'title', c.title,
                 'description', c.description,
                 'thumbnailUrl', c.thumbnail_url,
                 'status', c.status
               )
             )
           )
           FROM order_items oi
           JOIN courses c ON c.id = oi.course_id
           WHERE oi.order_id = o.id
         ),
         '[]'::json
       ) AS items
     FROM orders o
     WHERE o.user_id = $1
     ORDER BY o.created_at DESC`,
    [req.user.id]
  );

  res.json(result.rows);
}
