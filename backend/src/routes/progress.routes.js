const express = require('express');
const ProgressController = require('../controllers/progress.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

router.put('/:courseId/lesson/:lessonId/heartbeat', authMiddleware, ProgressController.heartbeat);
router.post('/:courseId/lesson/:lessonId/complete', authMiddleware, ProgressController.complete);
router.get('/:courseId/resume', authMiddleware, ProgressController.resume);

module.exports = router;
