import { create } from "zustand";

interface ProgressState {
  lessonId: string | null;
  watchedSeconds: number;
  isCompleted: boolean;
  setLesson: (lessonId: string, watchedSeconds: number, isCompleted: boolean) => void;
  updateHeartbeat: (watchedSeconds: number) => void;
  markCompleted: () => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  lessonId: null,
  watchedSeconds: 0,
  isCompleted: false,
  setLesson: (lessonId, watchedSeconds, isCompleted) =>
    set({ lessonId, watchedSeconds, isCompleted }),
  updateHeartbeat: (watchedSeconds) =>
    set((state) => ({ watchedSeconds: Math.max(state.watchedSeconds, watchedSeconds) })),
  markCompleted: () => set({ isCompleted: true }),
}));
