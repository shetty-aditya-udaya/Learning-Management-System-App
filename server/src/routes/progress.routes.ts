import { Router } from "express";
import { ProgressController } from "../controllers/progress.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.put("/:courseId/lesson/:lessonId/heartbeat", authenticate, ProgressController.heartbeat);
router.post("/:courseId/lesson/:lessonId/complete", authenticate, ProgressController.complete);
router.get("/:courseId/resume", authenticate, ProgressController.getResumeData);

export default router;
