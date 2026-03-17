"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { BookOpen, Mail, Lock, ArrowRight, Github, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const res = await api.post(endpoint, { email, password });
      
      setUser(res.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-200/40 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-200/40 rounded-full blur-[100px]" />

      <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white rounded-[32px] shadow-2xl shadow-purple-500/10 border border-slate-100 p-10 md:p-12">
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20 mb-6 group transition-all">
              <BookOpen size={32} className="group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {isLogin ? "Welcome back" : "Start learning"}
            </h2>
            <p className="text-slate-500 mt-2 font-medium">
              {isLogin ? "Unlock your potential today." : "Join thousands of students on their journey."}
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-100 animate-in shake duration-500">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium text-slate-900 placeholder-slate-400"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium text-slate-900 placeholder-slate-400"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-80 transition-opacity">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full flex items-center justify-center gap-2 py-4 shadow-xl"
            >
              {loading ? "Crunching bits..." : (isLogin ? "Sign In" : "Register Free")}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest text-slate-400"><span className="bg-white px-4">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
             <button className="flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-700">
                <Github size={18} />
                GitHub
             </button>
             <button className="flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-700">
                <Sparkles size={18} className="text-purple-500" />
                Google
             </button>
          </div>

          <p className="text-center font-bold text-slate-500">
             {isLogin ? "New to the platform?" : "Already an expert?"}{" "}
             <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)}
                className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 hover:underline transition-all"
             >
                {isLogin ? "Create account" : "Sign in here"}
             </button>
          </p>
        </div>
        
        <p className="mt-8 text-center text-slate-400 text-xs font-medium">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
