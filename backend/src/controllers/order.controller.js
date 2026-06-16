import { query, transaction } from "../db.js";

export async function checkout(req, res) {
  const cartResult = await query("SELECT * FROM carts WHERE user_id = $1", [req.user.id]);
  const cart = cartResult.rows[0];
  if (!cart) return res.status(400).json({ message: "Cart is empty" });

  const itemsResult = await query(
    `SELECT ci.course_id, c.price
     FROM cart_items ci
     JOIN courses c ON c.id = ci.course_id
     WHERE ci.cart_id = $1`,
    [cart.id]
  );
  const items = itemsResult.rows;
  if (!items.length) return res.status(400).json({ message: "Cart is empty" });

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const order = await transaction(async (client) => {
    const orderResult = await client.query(
      "INSERT INTO orders (user_id, total, status) VALUES ($1, $2, 'PAID') RETURNING *",
      [req.user.id, total]
    );
    const createdOrder = orderResult.rows[0];

    for (const item of items) {
      await client.query("INSERT INTO order_items (order_id, course_id, price) VALUES ($1, $2, $3)", [createdOrder.id, item.course_id, item.price]);
      await client.query(
        `INSERT INTO enrollments (user_id, course_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, course_id) DO NOTHING`,
        [req.user.id, item.course_id]
      );
    }

    const payment = await client.query("INSERT INTO payments (order_id, provider, status) VALUES ($1, 'MOCK', 'SUCCESS') RETURNING *", [createdOrder.id]);
    await client.query("DELETE FROM cart_items WHERE cart_id = $1", [cart.id]);

    return { ...createdOrder, items, payment: payment.rows[0] };
  });

  res.status(201).json(order);
}

export async function myOrders(req, res) {
  const orders = await query("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]);
  const result = [];

  for (const order of orders.rows) {
    const items = await query(
      `SELECT oi.*, c.title, c.description, c.thumbnail_url, c.status
       FROM order_items oi
       JOIN courses c ON c.id = oi.course_id
       WHERE oi.order_id = $1`,
      [order.id]
    );
    const payment = await query("SELECT * FROM payments WHERE order_id = $1", [order.id]);
    result.push({
      id: order.id,
      userId: order.user_id,
      total: order.total,
      status: order.status,
      createdAt: order.created_at,
      items: items.rows.map((row) => ({
        id: row.id,
        orderId: row.order_id,
        courseId: row.course_id,
        price: row.price,
        course: {
          id: row.course_id,
          title: row.title,
          description: row.description,
          thumbnailUrl: row.thumbnail_url,
          status: row.status,
        },
      })),
      payment: payment.rows[0] || null,
    });
  }

  res.json(result);
}
