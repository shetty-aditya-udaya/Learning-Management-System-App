const CourseService = require('../services/course.service');

class CourseController {
  static async getCourses(req, res) {
    try {
      const courses = await CourseService.getSubjects();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getCourseById(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId; // Optional if not logged in for public view
      const course = await CourseService.getSubjectById(courseId, userId);
      if (!course) return res.status(404).json({ message: 'Course not found' });
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async enroll(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user.userId;
      const result = await CourseService.enroll(userId, courseId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getCourseTree(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user.userId;
      const tree = await CourseService.getCourseTree(courseId, userId);
      res.json(tree);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  }

  static async getVideo(req, res) {
    try {
      const { courseId, lessonId } = req.params;
      const userId = req.user.userId;
      const video = await CourseService.getVideoData(userId, courseId, lessonId);
      res.json(video);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  }

  // Instructor Methods
  static async createCourse(req, res) {
    try {
      const { title, description, thumbnail_url } = req.body;
      const course = await CourseService.createSubject(title, description, thumbnail_url);
      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const { title, description, thumbnail_url } = req.body;
      const course = await CourseService.updateSubject(id, title, description, thumbnail_url);
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      await CourseService.deleteSubject(id);
      res.json({ message: 'Course deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async addSection(req, res) {
    try {
      const { courseId } = req.params;
      const { title, orderIndex } = req.body;
      const section = await CourseService.createSection(courseId, title, orderIndex);
      res.status(201).json(section);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async addVideo(req, res) {
    try {
      const { sectionId } = req.params;
      const { title, videoUrl, durationSeconds, orderIndex } = req.body;
      const video = await CourseService.createVideo(sectionId, title, videoUrl, durationSeconds, orderIndex);
      res.status(201).json(video);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getCourseLessons(req, res) {
    try {
      const lessons = await CourseService.getCourseLessons(req.params.courseId);
      res.json(lessons);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = CourseController;
