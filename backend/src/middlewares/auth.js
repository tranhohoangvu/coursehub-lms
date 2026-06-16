import jwt from "jsonwebtoken";
import { query } from "../db.js";

export async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "Missing authorization token" });

    const token = header.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [payload.id]
    );

    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid token" });
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.created_at };
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}
