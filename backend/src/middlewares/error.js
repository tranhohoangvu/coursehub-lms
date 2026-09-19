export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  // Catch Zod validation errors
  if (error.name === "ZodError" || error.issues) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.flatten ? error.flatten().fieldErrors : error.issues,
    });
  }

  // Catch duplicate key error in Postgres (code 23505)
  if (error.code === "23505") {
    return res.status(409).json({
      message: "Resource already exists or unique constraint violation",
      detail: error.detail,
    });
  }

  console.error(error);
  res.status(error.status || error.statusCode || 500).json({
    message: error.message || "Internal server error",
  });
}

