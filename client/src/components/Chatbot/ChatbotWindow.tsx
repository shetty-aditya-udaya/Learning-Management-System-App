"use client";

import React from 'react';
import { X, MessageCircle } from "lucide-react";
import ChatbotIframe from './ChatbotIframe';

interface ChatbotWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotWindow: React.FC<ChatbotWindowProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-5 w-[380px] h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100 z-[9998] animate-in slide-in-from-bottom-5 fade-in duration-500 ease-out">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-5 px-6 flex items-center justify-between text-white shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
             <MessageCircle size={22} className="fill-current" />
          </div>
          <div>
            <h3 className="font-black text-lg tracking-tight leading-none">BroKod</h3>
            <p className="text-[10px] font-bold text-purple-200 uppercase tracking-widest mt-1 opacity-80">AI Assistant</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors relative z-10"
          aria-label="Close chatbot"
        >
          <X size={20} />
        </button>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
      </div>

      {/* Main Content (Iframe) */}
      <div className="flex-1 bg-slate-50 relative">
        <ChatbotIframe />
      </div>

      {/* Footer */}
      <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-center">
         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            System Online
         </div>
      </div>
    </div>
  );
};

export default ChatbotWindow;
