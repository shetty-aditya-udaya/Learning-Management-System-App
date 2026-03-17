"use client";

import Link from "next/link";
import { LayoutDashboard, BookPlus, Settings, LogOut } from "lucide-react";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-indigo-600">Instructor Portal</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <Link 
            href="/dashboard/instructor/courses" 
            className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all font-semibold"
          >
            <LayoutDashboard size={20} />
            My Courses
          </Link>
          <Link 
            href="/dashboard/instructor/courses/new" 
            className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all font-semibold"
          >
            <BookPlus size={20} />
            Create Course
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link 
            href="/dashboard/courses" 
            className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
          >
            <LogOut size={16} />
            Exit Portal
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {children}
      </div>
    </div>
  );
}
