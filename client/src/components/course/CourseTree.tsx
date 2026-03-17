"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown, PlayCircle, CheckCircle, Lock, BookOpen } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  duration?: number;
  watchedSeconds?: number;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseTreeProps {
  courseId: string;
  sections: Section[];
  activeLessonId?: string;
}

export const CourseTree: React.FC<CourseTreeProps> = ({ courseId, sections, activeLessonId }) => {
  return (
    <div className="w-80 h-full flex flex-col bg-slate-50 border-r border-slate-200/60 overflow-hidden hidden lg:flex">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-200/60 bg-white">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen size={20} className="text-purple-600" />
          Course Content
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">12 Sections • 48 Lessons</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {sections.map((section, sIdx) => (
          <div key={section.id} className="border-b border-slate-200/40 last:border-0">
            {/* Section Header */}
            <div className="px-6 py-4 bg-slate-100/50 flex items-center justify-between group cursor-default hover:bg-slate-100 transition-colors">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Section {sIdx + 1}
              </span>
              <ChevronDown size={14} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <div className="px-6 pb-2 pt-1 bg-slate-50">
               <h3 className="text-sm font-bold text-slate-800 mb-4">{section.title}</h3>
               
               <div className="space-y-1 pb-4">
                  {section.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/dashboard/learn/${courseId}/lesson/${lesson.id}`}
                      className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 relative ${
                        activeLessonId === lesson.id
                          ? "bg-white shadow-md shadow-purple-500/5 border border-purple-100"
                          : lesson.isUnlocked 
                            ? "hover:bg-white hover:shadow-sm"
                            : "opacity-60 cursor-not-allowed"
                      }`}
                    >
                      {activeLessonId === lesson.id && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-600 rounded-r-full" />
                      )}

                      <div className={`shrink-0 transition-colors ${
                        activeLessonId === lesson.id ? "text-purple-600" : "text-slate-400"
                      }`}>
                         {lesson.isCompleted ? (
                           <CheckCircle size={18} className="text-emerald-500" />
                         ) : !lesson.isUnlocked ? (
                           <Lock size={18} />
                         ) : (
                           <PlayCircle size={18} className={activeLessonId === lesson.id ? "fill-purple-50" : ""} />
                         )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold leading-snug transition-colors truncate ${
                          activeLessonId === lesson.id ? "text-purple-700 font-bold" : "text-slate-600"
                        }`}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] font-medium text-slate-400">
                             {lesson.duration ? `${lesson.duration}m` : "Video Lesson"}
                          </span>
                          {!lesson.isCompleted && lesson.isUnlocked && (lesson.watchedSeconds || 0) > 0 && (
                            <span className="text-[10px] font-bold text-purple-600">
                               {Math.round((lesson.watchedSeconds || 0) / 60)}m watched
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
