import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    userId: string;
    username: string;
    timestamp: Date;
    status: 'sent' | 'delivered' | 'seen';
  };
  isOwnMessage: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage }) => {
  const getStatusIcon = () => {
    switch (message.status) {
      case 'seen':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOwnMessage
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        {!isOwnMessage && (
          <div className="text-xs font-semibold mb-1">{message.username}</div>
        )}
        <div className="text-sm">{message.content}</div>
        <div className="flex items-center justify-end mt-1 space-x-1">
          <span className="text-xs opacity-70">
            {format(new Date(message.timestamp), 'HH:mm')}
          </span>
          {isOwnMessage && getStatusIcon()}
        </div>
      </div>
    </div>
  );
}; 