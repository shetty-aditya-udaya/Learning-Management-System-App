"use client";

import React from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { CourseTree } from "@/components/course/CourseTree";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { ChevronLeft, ChevronRight, BookOpen, Share2, Info } from "lucide-react";

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function LessonPage({ 
  params 
}: { 
  params: Promise<{ courseId: string, lessonId: string }> 
}) {
  const { courseId, lessonId } = React.use(params);
  
  console.log(`[ROUTE-DEBUG] courseId: ${courseId}, lessonId: ${lessonId}`);

  const { data: treeData, error: treeError } = useSWR(`/courses/${courseId}/tree`, fetcher);
  const { data: lessonData, error: lessonError } = useSWR(`/courses/${courseId}/lesson/${lessonId}`, fetcher);

  if (treeError || lessonError) {
      return (
         <div className="flex-1 p-8 flex items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-3xl border border-red-100 max-w-md text-center shadow-xl animate-in zoom-in-95 duration-300">
               <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Info size={32} />
               </div>
               <h2 className="font-bold text-2xl mb-2 text-slate-900">Access Denied</h2>
               <p className="text-slate-500 mb-6">{lessonError?.response?.data?.message || "You cannot view this lesson right now. Please enroll to continue."}</p>
               <button className="btn-premium w-full">Go to Catalog</button>
            </div>
         </div>
      );
  }

  if (!treeData || !lessonData) {
      return (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 h-full bg-slate-200 animate-pulse hidden lg:block" />
          <div className="flex-1 p-8 bg-slate-50 animate-pulse space-y-8">
             <div className="h-10 w-1/3 bg-slate-200 rounded-lg" />
             <div className="aspect-video bg-slate-200 rounded-3xl shadow-lg" />
          </div>
        </div>
      );
  }

  let initialSeconds = 0;
  if (treeData && Array.isArray(treeData.tree)) {
    treeData.tree.forEach((section: any) => {
       const found = section.lessons?.find((l: any) => l.id === lessonId);
       if (found && found.watchedSeconds) {
           initialSeconds = found.watchedSeconds;
       }
    });
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      <CourseTree 
         courseId={courseId}
         sections={treeData.tree} 
         activeLessonId={lessonId} 
      />
      
      <div className="flex-1 overflow-y-auto bg-slate-50/50">
         <div className="sticky top-0 z-20 h-1 bg-white" /> {/* Spacing helper */}
         
         <div className="max-w-5xl mx-auto px-6 lg:px-12 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumbs / Header Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <BookOpen size={14} />
                 <span>Lesson {lessonData.order_index}</span>
                 <span className="text-slate-200 mx-1">•</span>
                 <span className="text-purple-600">{lessonData.duration} min</span>
              </div>
              <button className="p-2 text-slate-400 hover:text-purple-600 transition-colors">
                 <Share2 size={18} />
              </button>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {lessonData.title}
            </h1>
            
            {/* Video Area */}
            <div className="relative group">
               <VideoPlayer 
                   courseId={courseId}
                   lessonId={lessonId}
                   videoUrl={lessonData.video_url}
                   initialSeconds={initialSeconds}
                   nextLessonId={lessonData.next_lesson_id}
               />
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-4 py-2">
                <button
                  onClick={() => lessonData.prev_lesson_id && (window.location.href = `/learn/${courseId}/lesson/${lessonData.prev_lesson_id}`)}
                  disabled={!lessonData.prev_lesson_id}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                   <ChevronLeft size={20} />
                   <span>Previous</span>
                </button>
                <button
                  onClick={() => lessonData.next_lesson_id && (window.location.href = `/learn/${courseId}/lesson/${lessonData.next_lesson_id}`)}
                  disabled={!lessonData.next_lesson_id}
                  className="flex-[2] btn-premium flex items-center justify-center gap-2 px-6 py-4"
                >
                   <span>Next Lesson</span>
                   <ChevronRight size={20} />
                </button>
             </div>

            {/* Lesson Info Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                     <Info size={20} />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 tracking-tight">About this lesson</h3>
               </div>
               <p className="text-slate-500 leading-relaxed text-lg">
                  In this module, you will master the core foundations of <span className="text-slate-900 font-semibold">{lessonData.title}</span>. 
                  Watch closely and follow along with the exercises provided. Completion of this video will 
                  automatically unlock the next challenge in your curriculum.
               </p>
               <div className="pt-4 flex flex-wrap gap-3">
                  {["Foundation", "Hands-on", "Core Concept"].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-500 uppercase tracking-widest">
                       {tag}
                    </span>
                  ))}
               </div>
            </div>
         </div>
         <div className="h-20" /> {/* Bottom spacing */}
      </div>
    </div>
  );
}
