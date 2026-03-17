import { AppDataSource } from "../config/database";
import { Progress } from "../entities/Progress";
import { Enrollment } from "../entities/Enrollment";
import { Lesson } from "../entities/Lesson";

const progressRepo = AppDataSource.getRepository(Progress);
const enrollmentRepo = AppDataSource.getRepository(Enrollment);
const lessonRepo = AppDataSource.getRepository(Lesson);

export class ProgressService {
   static async heartbeat(userId: string, courseId: string, lessonId: string, watchedSeconds: number) {
      // Find Enrollment
      const enrollment = await enrollmentRepo.findOne({
          where: { user: { id: userId }, course: { id: courseId } }
      });

      if (!enrollment) throw new Error("Not enrolled in this course");

      // Verify the lesson exists
      const lesson = await lessonRepo.findOne({
          where: { id: lessonId }
      });

      if (!lesson) throw new Error("Lesson not found");

      // Find or Create Progress
      let progress = await progressRepo.findOne({
          where: { enrollment: { id: enrollment.id }, lesson: { id: lessonId } }
      });

      if (!progress) {
          progress = progressRepo.create({
              enrollment,
              lesson,
              watched_seconds: watchedSeconds
          });
      } else {
          // Idempotent write: Only move forward, don't revert progress
          if (watchedSeconds > progress.watched_seconds) {
              progress.watched_seconds = watchedSeconds;
          }
      }

      await progressRepo.save(progress);
      return progress;
   }

   static async complete(userId: string, courseId: string, lessonId: string) {
       // Find Enrollment
      const enrollment = await enrollmentRepo.findOne({
         where: { user: { id: userId }, course: { id: courseId } }
      });

      if (!enrollment) throw new Error("Not enrolled in this course");

      // Find Progress
      let progress = await progressRepo.findOne({
          where: { enrollment: { id: enrollment.id }, lesson: { id: lessonId } }
      });

      if (!progress) {
          throw new Error("Cannot complete a lesson without prior progress");
      }

      progress.is_completed = true;
      progress.watched_seconds = (await progress.lesson).duration_seconds; // Auto-fill to end
      await progressRepo.save(progress);

      return progress;
   }

   static async getResumeData(userId: string, courseId: string) {
      const enrollment = await enrollmentRepo.findOne({
          where: { user: { id: userId }, course: { id: courseId } }
      });

      if (!enrollment) throw new Error("Not enrolled");

      // Find the last watched lesson that is NOT completed
      const lastProgress = await progressRepo.findOne({
          where: { 
              enrollment: { id: enrollment.id },
              is_completed: false 
          },
          relations: ["lesson"],
          order: {
              last_watched_at: "DESC"
          }
      });

      if (!lastProgress) {
          // If no uncompleted progress, find the absolute newest
          const completeProgress = await progressRepo.findOne({
             where: { enrollment: { id: enrollment.id } },
             relations: ["lesson"],
             order: { last_watched_at: "DESC" }
          });
          
          if (!completeProgress) return null; // No history
          return { lessonId: completeProgress.lesson.id, watched_seconds: completeProgress.watched_seconds };
      }

      return { lessonId: lastProgress.lesson.id, watched_seconds: lastProgress.watched_seconds };
   }
}
