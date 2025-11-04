import React, { useState, useCallback } from 'react';
import type { NotificationMessage, User } from './types';
import { useQuizzes } from './hooks/useQuizzes';

import Header from './components/Header';
import QuizList from './components/QuizList';
import PreviewModal from './components/PreviewModal';
import Notification from './components/Notification';
import Spinner from './components/Spinner';

interface UserDashboardProps {
  user: User;
  isWhitelisted: boolean;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, isWhitelisted }) => {
  const { quizzes: allQuizzes, isLoading, error } = useQuizzes();
  
  const [notification, setNotification] = useState<NotificationMessage | null>(
    null
  );
  const [previewQuiz, setPreviewQuiz] = useState<{
    url: string;
    title: string;
  } | null>(null);
  
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showNotification("URL copied to clipboard!", 'success');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        showNotification("Error: Could not copy URL.", 'error');
      });
  };

  const handlePreviewQuiz = useCallback((url: string, title: string) => {
    setPreviewQuiz({ url, title });
  }, []);
  
  const handleCloseModal = useCallback(() => {
    setPreviewQuiz(null);
  }, []);

  const quizzesToDisplay = isWhitelisted ? allQuizzes : [];

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <Header user={user} />

      <main>
        {notification && <Notification message={notification.message} type={notification.type} />}
        {error && <Notification message={error} type="error" />}

        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2 mt-8">
          Available Content
        </h2>

        {isLoading ? (
          <Spinner />
        ) : (
          <QuizList 
            quizzes={quizzesToDisplay}
            isAdmin={false}
            onDelete={() => {}} // No-op for users
            onPreview={handlePreviewQuiz}
            onCopy={handleCopyToClipboard}
          />
        )}
      </main>

      {previewQuiz && (
        <PreviewModal 
          url={previewQuiz.url}
          title={previewQuiz.title}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default UserDashboard;