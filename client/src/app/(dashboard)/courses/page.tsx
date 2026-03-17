"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import CourseCard from "@/components/course/CourseCard";
import { Search, Filter, Sparkles } from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string;
  short_description: string;
  thumbnail_url: string;
  instructor_name: string;
  total_lessons: number;
  total_duration: number;
  progress?: number;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await api.get("/courses");
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
        <div className="h-12 w-64 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[450px] bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            Explore Catalog
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Expand your <span className="gradient-text">horizon</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl leading-relaxed">
            Discover world-class courses designed to help you master new skills and advance your career.
          </p>
        </div>

        {/* Search/Filter (Visual placeholders) */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all w-64 shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={18} className="text-slate-600" />
          </button>
        </div>
      </div>
      
      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <CourseCard 
            key={course.id}
            id={course.id}
            title={course.title}
            instructor_name={course.instructor_name}
            short_description={course.short_description || course.description}
            thumbnail_url={course.thumbnail_url}
            total_lessons={course.total_lessons}
            progress={Math.floor(Math.random() * 100)} // Mocking progress for visual flair
          />
        ))}
      </div>

      {courses.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-bold text-slate-900">No courses found</h2>
          <p className="text-slate-500">We couldn't find any courses matching your criteria. Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
}
