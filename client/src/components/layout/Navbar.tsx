"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, User, Bell, LogOut, Menu } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { getDisplayName, getInitials } from "@/lib/userUtils";

export const Navbar = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  return (
    <nav className="sticky top-0 z-[50] w-full border-b border-slate-100 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
            <BookOpen size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            LMS Platform
          </span>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/dashboard/courses" className="text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors">
            Courses
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors">
            Dashboard
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          <div className="h-8 w-[1px] bg-slate-200"></div>

          <div className="flex items-center gap-3 pl-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-purple-100 to-blue-100 text-purple-600 font-bold border border-purple-200">
              {getInitials(user)}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none">{getDisplayName(user)}</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">{user?.role || "Student"} Account</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-xs"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
          
          <button className="md:hidden p-2 text-slate-600">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};
