"use client";

import React from 'react';
import ChatbotIframe from '@/components/Chatbot/ChatbotIframe';

const ChatbotPage = () => {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <ChatbotIframe />
    </div>
  );
};

export default ChatbotPage;
