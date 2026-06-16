import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorHandler, notFound } from "./middlewares/error.js";

const app = express();
const port = process.env.PORT || 5000;

// Sanitize CLIENT_URL to remove trailing slash if present
let clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";
if (clientOrigin.endsWith("/")) {
  clientOrigin = clientOrigin.slice(0, -1);
}

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "CourseHub API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
