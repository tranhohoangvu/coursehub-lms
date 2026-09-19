import { Router } from "express";
import {
  dashboard,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listAllCourses,
  adminCreateCourse,
  updateCourseStatus,
  deleteCourse,
  listInstructors,
  listEnrollments,
  createEnrollment,
  deleteEnrollment,
  listCategories,
} from "../controllers/admin.controller.js";
import { allowRoles, authRequired } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Protect all admin routes with authRequired and allowRoles("ADMIN")
router.use(authRequired, allowRoles("ADMIN"));

router.get("/dashboard", asyncHandler(dashboard));
router.get("/users", asyncHandler(listUsers));
router.post("/users", asyncHandler(createUser));
router.patch("/users/:id", asyncHandler(updateUser));
router.delete("/users/:id", asyncHandler(deleteUser));

router.get("/courses", asyncHandler(listAllCourses));
router.post("/courses", asyncHandler(adminCreateCourse));
router.patch("/courses/:id/status", asyncHandler(updateCourseStatus));
router.delete("/courses/:id", asyncHandler(deleteCourse));

router.get("/instructors", asyncHandler(listInstructors));
router.get("/enrollments", asyncHandler(listEnrollments));
router.post("/enrollments", asyncHandler(createEnrollment));
router.delete("/enrollments/:id", asyncHandler(deleteEnrollment));

router.get("/categories", asyncHandler(listCategories));

export default router;
