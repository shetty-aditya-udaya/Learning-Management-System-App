import { Request, Response } from "express";
import { CourseService } from "../services/course.service";

export class CourseController {
  static async listPublished(req: Request, res: Response) {
      try {
          const courses = await CourseService.getPublishedCourses();
          res.status(200).json(courses);
      } catch (error: any) {
          res.status(500).json({ message: "Error fetching courses" });
      }
  }

  static async getTree(req: Request, res: Response) {
      try {
          // req.user injected by authenticate middleware
          const userId = (req as any).user.userId;
          const { courseId } = req.params;

          const tree = await CourseService.getCourseTree(courseId as string, userId);
          res.status(200).json(tree);
      } catch (error: any) {
          res.status(403).json({ message: error.message || "Forbidden" });
      }
  }

  static async getLesson(req: Request, res: Response) {
      try {
          const userId = (req as any).user.userId;
          const { courseId, lessonId } = req.params;

          const lesson = await CourseService.getLessonData(userId, courseId as string, lessonId as string);
          res.status(200).json(lesson);
      } catch (error: any) {
          res.status(403).json({ message: error.message || "Access Denied" });
      }
  }
}
