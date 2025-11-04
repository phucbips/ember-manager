
import React from 'react';
import type { NotificationMessage } from '../types';

const Notification: React.FC<NotificationMessage> = ({ message, type }) => {
  const baseClasses = 'mt-4 p-3 rounded-lg text-center font-medium animate-fade-in';
  const typeClasses = type === 'success' 
    ? 'bg-green-100 text-green-700' 
    : 'bg-red-100 text-red-700';

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {message}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Notification;
