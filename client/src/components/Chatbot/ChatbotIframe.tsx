import React from 'react';

const ChatbotIframe = () => {
  return (
    <div className="w-full h-full border-none overflow-hidden bg-white">
      <iframe
        src="https://aditya762-chatbot.hf.space"
        title="Chatbot"
        className="w-full h-full border-none"
        allow="microphone; camera"
        frameBorder="0"
      />
    </div>
  );
};

export default ChatbotIframe;
