import { Request, Response } from "express";
import { ProgressService } from "../services/progress.service";

export class ProgressController {
   static async heartbeat(req: Request, res: Response) {
      try {
          const userId = (req as any).user.userId;
          const { courseId, lessonId } = req.params;
          const { watchedSeconds } = req.body;

          const progress = await ProgressService.heartbeat(userId, courseId as string, lessonId as string, watchedSeconds);
          res.status(200).json(progress);
      } catch (error: any) {
          res.status(400).json({ message: error.message || "Failed to update progress" });
      }
   }

   static async complete(req: Request, res: Response) {
      try {
          const userId = (req as any).user.userId;
          const { courseId, lessonId } = req.params;

          const progress = await ProgressService.complete(userId, courseId as string, lessonId as string);
          res.status(200).json(progress);
      } catch (error: any) {
          res.status(400).json({ message: error.message || "Failed to complete lesson" });
      }
   }

   static async getResumeData(req: Request, res: Response) {
       try {
          const userId = (req as any).user.userId;
          const { courseId } = req.params;

          const data = await ProgressService.getResumeData(userId, courseId as string);
          res.status(200).json(data);
      } catch (error: any) {
          res.status(400).json({ message: error.message || "Failed to fetch resume data" });
      }
   }
}
