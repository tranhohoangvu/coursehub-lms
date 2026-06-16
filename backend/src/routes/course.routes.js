import { Router } from "express";
import {
  createCourse,
  createLesson,
  getCourse,
  getMyCourses,
  listCourses,
  markLessonCompleted,
  markLessonIncomplete,
  reviewCourse,
  updateCourse,
} from "../controllers/course.controller.js";
import { allowRoles, authRequired } from "../middlewares/auth.js";

const router = Router();

router.get("/", listCourses);
router.get("/mine", authRequired, getMyCourses);
router.get("/:id", getCourse);
router.post("/", authRequired, allowRoles("INSTRUCTOR", "ADMIN"), createCourse);
router.patch("/:id", authRequired, allowRoles("INSTRUCTOR", "ADMIN"), updateCourse);
router.post("/:id/lessons", authRequired, allowRoles("INSTRUCTOR", "ADMIN"), createLesson);
router.post("/:id/reviews", authRequired, reviewCourse);
router.post("/lessons/:lessonId/complete", authRequired, markLessonCompleted);
router.post("/lessons/:lessonId/incomplete", authRequired, markLessonIncomplete);

export default router;
