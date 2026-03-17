"use client";

import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import ChatbotWindow from './ChatbotWindow';

const ChatbotLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-5 right-5 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-500 z-[9999] group overflow-hidden ${
          isOpen 
            ? "bg-gradient-to-br from-red-500 to-rose-600 rotate-90 scale-110" 
            : "bg-gradient-to-br from-purple-600 to-blue-600 hover:scale-110 active:scale-95 animate-pulse-glow"
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="text-white" size={28} />
        ) : (
          <MessageSquare className="text-white" size={28} />
        )}
        
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        )}
      </button>

      <ChatbotWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChatbotLauncher;
