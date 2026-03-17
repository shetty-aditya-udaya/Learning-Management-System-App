import { Router } from "express";
import { CourseController } from "../controllers/course.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", CourseController.listPublished);
router.get("/:courseId/tree", authenticate, CourseController.getTree);
router.get("/:courseId/lesson/:lessonId", authenticate, CourseController.getLesson);

export default router;
