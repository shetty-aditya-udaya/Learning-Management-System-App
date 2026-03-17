import { AppDataSource } from "../config/database";
import { Course } from "../entities/Course";
import { Section } from "../entities/Section";
import { Lesson } from "../entities/Lesson";
import { Progress } from "../entities/Progress";
import { Enrollment } from "../entities/Enrollment";

const courseRepo = AppDataSource.getRepository(Course);
const progressRepo = AppDataSource.getRepository(Progress);
const enrollmentRepo = AppDataSource.getRepository(Enrollment);
const lessonRepo = AppDataSource.getRepository(Lesson);

export class CourseService {
  static async getPublishedCourses() {
    return courseRepo.find({ where: { published: true } });
  }

  static async getCourseTree(courseId: string, userId: string) {
    // Check enrollment
    const enrollment = await enrollmentRepo.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });

    if (!enrollment) {
      throw new Error("User not enrolled in this course");
    }

    // Get course tree (Sections -> Lessons)
    const course = await courseRepo.findOne({
      where: { id: courseId },
      relations: ["sections", "sections.lessons"],
      order: {
        sections: {
          order_index: "ASC",
          lessons: {
             order_index: "ASC"
          }
        },
      },
    });

    if (!course) throw new Error("Course not found");

    // Get progress
    const progressRecords = await progressRepo.find({
      where: { enrollment: { id: enrollment.id } },
      relations: ["lesson"],
    });

    const progressMap = new Map<string, Progress>(
      progressRecords.map((p: Progress) => [p.lesson.id, p])
    );

    // Build the tree with lock status
    const tree = course.sections.map((section: Section) => {
      return {
        id: section.id,
        title: section.title,
        order_index: section.order_index,
        lessons: section.lessons.map((lesson: Lesson) => {
          const progress = progressMap.get(lesson.id);
          const isCompleted = progress?.is_completed || false;
          
          // Strict ordering check: is the previous video completed?
          let isLocked = false;
          if (lesson.order_index > 1) {
             const prevLesson = section.lessons.find((l: Lesson) => l.order_index === lesson.order_index - 1);
             if (prevLesson) {
                const prevProgress = progressMap.get(prevLesson.id);
                if (!prevProgress || !prevProgress.is_completed) {
                   isLocked = true; // Lock if prev video is missing or incomplete
                }
             }
          }

          return {
            id: lesson.id,
            title: lesson.title,
            duration: lesson.duration_seconds,
            order_index: lesson.order_index,
            isCompleted,
            watchedSeconds: progress?.watched_seconds || 0,
            isLocked
          };
        }),
      };
    });

    return { courseId: course.id, title: course.title, tree };
  }

  static async getLessonData(userId: string, courseId: string, lessonId: string) {
      const treeData = await this.getCourseTree(courseId, userId);
      
      // Find the lesson in the tree to check if it's locked
      let targetLesson: any = null;
      for (const section of treeData.tree) {
         const found = section.lessons.find((l: any) => l.id === lessonId);
         if (found) {
            targetLesson = found;
            break;
         }
      }

      if (!targetLesson) {
         throw new Error("Lesson not found in this course");
      }

      if (targetLesson.isLocked) {
         throw new Error("Lesson is locked. Please complete prior lessons first.");
      }

      // If unlocked, fetch the full lesson including the video URL
      const lesson = await lessonRepo.findOneBy({ id: lessonId });
      return lesson;
  }
}
