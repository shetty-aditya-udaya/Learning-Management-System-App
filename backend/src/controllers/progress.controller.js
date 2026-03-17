const ProgressService = require('../services/progress.service');

class ProgressController {
  static async heartbeat(req, res) {
    try {
      const { lessonId } = req.params;
      const { watchedSeconds } = req.body;
      const userId = req.user.userId;

      await ProgressService.heartbeat(userId, lessonId, watchedSeconds);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async complete(req, res) {
    try {
      const { lessonId } = req.params;
      const userId = req.user.userId;

      await ProgressService.complete(userId, lessonId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async resume(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user.userId;

      const data = await ProgressService.getResumeData(userId, courseId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = ProgressController;
