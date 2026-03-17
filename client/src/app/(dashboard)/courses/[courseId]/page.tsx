"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Clock, BookOpen, User, CheckCircle, ArrowRight } from "lucide-react";

type CourseDetail = {
  id: string;
  title: string;
  description: string;
  short_description: string;
  learning_goals: string;
  thumbnail_url: string;
  instructor_name: string;
  total_lessons: number;
  total_duration: number;
  isEnrolled: boolean;
};

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const router = useRouter();
  const { courseId } = React.use(params);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await api.get(`/courses/${courseId}`);
        setCourse(res.data);
      } catch (err) {
        console.error("Failed to load course details", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!course) return;
    
    if (course.isEnrolled) {
      // Find resume point or start from beginning
      try {
        const resumeRes = await api.get(`/progress/${courseId}/resume`);
        if (resumeRes.data && resumeRes.data.lessonId) {
          router.push(`/learn/${courseId}/lesson/${resumeRes.data.lessonId}`);
        } else {
          const treeRes = await api.get(`/courses/${courseId}/tree`);
          const firstLesson = treeRes.data.tree[0]?.lessons[0];
          if (firstLesson) {
             router.push(`/learn/${courseId}/lesson/${firstLesson.id}`);
          }
        }
      } catch (err) {
        console.error("Navigation failed", err);
      }
      return;
    }

    setEnrolling(true);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setCourse({ ...course, isEnrolled: true });
      // Show success or just redirect to learn
      const treeRes = await api.get(`/courses/${courseId}/tree`);
      const firstLesson = treeRes.data.tree[0]?.lessons[0];
      if (firstLesson) {
         router.push(`/learn/${courseId}/lesson/${firstLesson.id}`);
      }
    } catch (err) {
      alert("Enrollment failed. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading course...</div>;
  if (!course) return <div className="p-8 text-center text-red-500 font-bold">Course Not Found</div>;

  const durationHours = Math.floor(course.total_duration / 3600);
  const durationMins = Math.floor((course.total_duration % 3600) / 60);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-indigo-900 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              {course.title}
            </h1>
            <p className="text-xl text-indigo-100 leading-relaxed">
              {course.short_description || course.description}
            </p>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <User size={18} className="text-indigo-300" />
                <span className="font-medium">{course.instructor_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-300" />
                <span>{course.total_lessons} Lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-indigo-300" />
                <span>{durationHours}h {durationMins}m</span>
              </div>
            </div>

            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-8 py-4 bg-white text-indigo-900 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {course.isEnrolled ? (
                <>
                  Continue Course <ArrowRight size={20} />
                </>
              ) : (
                <>
                  {enrolling ? "Enrolling..." : "Enroll in Course"} <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>

          <div className="relative group">
            <div className="aspect-video bg-indigo-800 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl font-black text-indigo-700/50">
                   LMS
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              Description
            </h2>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed text-lg">
              {course.description}
            </div>
          </section>

          {course.learning_goals && (
            <section>
              <h2 className="text-2xl font-bold mb-6">What you'll learn</h2>
              <div className="bg-indigo-50/50 p-8 rounded-2xl border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.learning_goals.split(',').map((goal, i) => (
                  <div key={i} className="flex gap-3 text-gray-700 font-medium">
                    <CheckCircle className="text-indigo-600 flex-shrink-0" size={20} />
                    {goal.trim()}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-8">
            <h3 className="font-bold text-lg mb-4">Course Details</h3>
            <ul className="space-y-4">
              <li className="flex justify-between text-sm">
                <span className="text-gray-500">Access</span>
                <span className="font-medium">Lifetime</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-gray-500">Video Hosting</span>
                <span className="font-medium">YouTube</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-gray-500">Certificate</span>
                <span className="font-medium">Available</span>
              </li>
            </ul>
            <hr className="my-6 border-gray-50" />
            <button
               onClick={handleEnroll}
               className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
            >
               {course.isEnrolled ? "Resume Now" : "Start Learning"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
