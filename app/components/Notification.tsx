import React from 'react';
import { useState, useEffect } from 'react';
import type { NotificationMessage } from '../types';

interface NotificationProps extends NotificationMessage {
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          setTimeout(onClose, 300); // Wait for animation to complete
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300);
    }
  };

  const baseClasses = 'mt-4 p-4 rounded-lg text-center font-medium transition-all duration-300 flex items-center justify-between gap-4';
  
  const typeClasses = {
    success: 'bg-green-100 text-green-700 border border-green-200',
    error: 'bg-red-100 text-red-700 border border-red-200',
    warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    info: 'bg-blue-100 text-blue-700 border border-blue-200',
  };

  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  if (!isVisible) return null;

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{iconMap[type]}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={handleClose}
          className="text-current hover:opacity-75 transition-opacity"
          aria-label="Close notification"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Notification;