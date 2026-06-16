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

const router = Router();

// Protect all admin routes with authRequired and allowRoles("ADMIN")
router.use(authRequired, allowRoles("ADMIN"));

router.get("/dashboard", dashboard);
router.get("/users", listUsers);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/courses", listAllCourses);
router.post("/courses", adminCreateCourse);
router.patch("/courses/:id/status", updateCourseStatus);
router.delete("/courses/:id", deleteCourse);

router.get("/instructors", listInstructors);
router.get("/enrollments", listEnrollments);
router.post("/enrollments", createEnrollment);
router.delete("/enrollments/:id", deleteEnrollment);

router.get("/categories", listCategories);

export default router;
