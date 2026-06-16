import bcrypt from "bcryptjs";
import { z } from "zod";
import { query } from "../db.js";
import { signToken } from "../utils/token.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function toSafeUser(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role, createdAt: row.created_at };
}

export async function register(req, res) {
  const data = registerSchema.parse(req.body);
  const existing = await query("SELECT id FROM users WHERE email = $1", [data.email]);
  if (existing.rowCount) return res.status(409).json({ message: "Email already exists" });

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const result = await query(
    `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)
     RETURNING id, name, email, role, created_at`,
    [data.name, data.email, hashedPassword]
  );
  const user = toSafeUser(result.rows[0]);
  res.status(201).json({ user, token: signToken(user) });
}

export async function login(req, res) {
  const data = loginSchema.parse(req.body);
  const result = await query("SELECT * FROM users WHERE email = $1", [data.email]);
  const row = result.rows[0];
  if (!row) return res.status(401).json({ message: "Invalid credentials" });

  const isValid = await bcrypt.compare(data.password, row.password);
  if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

  const user = toSafeUser(row);
  res.json({ user, token: signToken(user) });
}

export async function me(req, res) {
  res.json({ user: req.user });
}
