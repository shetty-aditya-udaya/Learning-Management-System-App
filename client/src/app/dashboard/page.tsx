"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import CourseCard from "@/components/course/CourseCard";
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  PlayCircle,
  Trophy,
  Zap
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { getDisplayName } from "@/lib/userUtils";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await api.get("/courses");
        setCourses(res.data.slice(0, 3)); // Just get first 3 for recommendations
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 animate-pulse">Loading dashboard...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-purple-200 border border-white/10">
            <Zap size={14} className="fill-current" />
            Ready to learn?
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{getDisplayName(user)}!</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            You've completed 75% of your weekly goal. Keep it up and reach the top 5% of learners this month!
          </p>
          <div className="flex gap-4 pt-2">
            <button className="btn-premium">View My Progress</button>
            <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all">
              Schedule Study
            </button>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-600/20 to-transparent pointer-none"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] pointer-none"></div>
      </section>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Courses Active", value: "4", icon: PlayCircle, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Completed", value: "12", icon: Trophy, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Study Time", value: "24h", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Global Rank", value: "#142", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <div key={i} className="card-premium p-6 flex items-center gap-5 border-none shadow-md">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Focus on your <span className="gradient-text">goals</span></h2>
            <p className="text-slate-500">Pick up where you left off or start something new.</p>
          </div>
          <button onClick={() => window.location.href = "/dashboard/courses"} className="text-purple-600 font-bold hover:underline transition-all">View All Courses</button>
        </div>

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
              progress={Math.floor(Math.random() * 40 + 10)} 
            />
          ))}
        </div>
      </section>
    </div>
  );
}
