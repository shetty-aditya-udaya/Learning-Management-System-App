"use client";

import React from "react";
import Link from "next/link";
import { Clock, BookOpen, User, ArrowRight } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  instructor_name: string;
  short_description: string;
  thumbnail_url?: string;
  total_lessons: number;
  progress?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  instructor_name,
  short_description,
  thumbnail_url,
  total_lessons,
  progress = 0,
}) => {
  return (
    <div className="card-premium group flex flex-col h-full overflow-hidden">
      {/* Thumbnail Area */}
      <div className="relative h-52 w-full overflow-hidden">
        {thumbnail_url ? (
          <img
            src={thumbnail_url}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600 text-white font-bold text-3xl">
            {title.substring(0, 2).toUpperCase()}
          </div>
        )}
        
        {/* Overlay Badges */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-purple-600 shadow-lg border border-purple-100 flex items-center gap-1">
          <Clock size={12} />
          {total_lessons} Lessons
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col pt-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center">
              <User size={12} className="text-purple-600" />
            </div>
            <span className="text-xs font-medium text-slate-500">{instructor_name}</span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2 leading-snug mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {short_description}
          </p>
        </div>

        {/* Progress Section */}
        {progress > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
              <span className="text-[10px] font-bold text-purple-600">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(124,58,237,0.3)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link 
          href={`/courses/${id}`}
          className="btn-premium group/btn flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
        >
          {progress > 0 ? "Continue Learning" : "Enroll Now"}
          <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
