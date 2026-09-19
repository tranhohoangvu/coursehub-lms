import { Router } from "express";
import {
  createCourse,
  createLesson,
  getCourse,
  getMyCourses,
  listCourses,
  listCategories,
  listInstructorCourses,
  markLessonCompleted,
  markLessonIncomplete,
  reviewCourse,
  updateCourse,
  updateLesson,
  deleteLesson,
  deleteCourse,
  checkEnrollment,
} from "../controllers/course.controller.js";
import { allowRoles, authRequired } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listCourses));
router.get("/categories", asyncHandler(listCategories));
router.get("/mine", authRequired, asyncHandler(getMyCourses));
router.get("/instructor/mine", authRequired, allowRoles("INSTRUCTOR", "ADMIN"), asyncHandler(listInstructorCourses));
router.get("/:id", asyncHandler(getCourse));
router.post("/", authRequired, allowRoles("INSTRUCTOR", "ADMIN"), asyncHandler(createCourse));
router.patch("/:id", authRequired, allowRoles("INSTRUCTOR", "ADMIN"), asyncHandler(updateCourse));
router.delete("/:id", authRequired, allowRoles("INSTRUCTOR", "ADMIN"), asyncHandler(deleteCourse));

router.post("/:id/lessons", authRequired, allowRoles("INSTRUCTOR", "ADMIN"), asyncHandler(createLesson));
router.patch("/lessons/:lessonId", authRequired, allowRoles("INSTRUCTOR", "ADMIN"), asyncHandler(updateLesson));
router.delete("/lessons/:lessonId", authRequired, allowRoles("INSTRUCTOR", "ADMIN"), asyncHandler(deleteLesson));

router.post("/:id/reviews", authRequired, asyncHandler(reviewCourse));
router.post("/lessons/:lessonId/complete", authRequired, asyncHandler(markLessonCompleted));
router.post("/lessons/:lessonId/incomplete", authRequired, asyncHandler(markLessonIncomplete));
router.get("/:id/enrollment", authRequired, asyncHandler(checkEnrollment));

export default router;
