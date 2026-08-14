import React from 'react';
import { Bot, User } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const isBot = message.sender === 'bot';

  return (
    <div className={`flex w-full mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-light-blue text-white flex items-center justify-center mr-2 shadow-md flex-shrink-0">
          <Bot size={14} />
        </div>
      )}
      
      <div 
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isBot 
            ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-none' 
            : 'bg-light-blue text-white rounded-tr-none'
        }`}
      >
        <div className="text-[14px] leading-relaxed whitespace-pre-wrap">
          {message.text}
        </div>
        <div className={`text-[10px] mt-1.5 ${isBot ? 'text-slate-400' : 'text-blue-100'} text-right`}>
          {message.time || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>

      {!isBot && (
        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center ml-2 shadow-sm flex-shrink-0">
          <User size={14} />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
