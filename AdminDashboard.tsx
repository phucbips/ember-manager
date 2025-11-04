import React, { useState, useCallback } from 'react';
import type { NotificationMessage, User } from './types';
import {
  addQuiz as fbAddQuiz,
  deleteQuiz as fbDeleteQuiz,
} from './services/firebaseService';
import { useQuizzes } from './hooks/useQuizzes';

import Header from './components/Header';
import EmbedForm from './components/EmbedForm';
import QuizList from './components/QuizList';
import PreviewModal from './components/PreviewModal';
import Notification from './components/Notification';
import Spinner from './components/Spinner';
import WhitelistManager from './components/WhitelistManager';

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const { quizzes, isLoading, error } = useQuizzes();
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

  const handleAddQuiz = async (embedCode: string) => {
    try {
      const { quizUrl, title } = await fbAddQuiz(user.uid, embedCode);
      showNotification("Content saved successfully!", 'success');
      setPreviewQuiz({ url: quizUrl, title: title });
    } catch (error) {
      if (error instanceof Error) {
        showNotification(error.message, 'error');
      } else {
        showNotification("An unknown error occurred.", 'error');
      }
    }
  };

  const handleDeleteQuiz = async (docId: string) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;
    try {
      await fbDeleteQuiz(docId);
      showNotification("Content deleted successfully!", 'success');
    } catch (error) {
       if (error instanceof Error) {
        showNotification(`Error deleting content: ${error.message}`, 'error');
      } else {
        showNotification("An unknown error occurred while deleting.", 'error');
      }
    }
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

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <Header user={user} />

      <main>
        <EmbedForm onAddQuiz={handleAddQuiz} />

        <WhitelistManager showNotification={showNotification} />

        {notification && <Notification message={notification.message} type={notification.type} />}
        {error && <Notification message={error} type="error" />}

        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2 mt-8">
          Your Saved Content
        </h2>

        {isLoading ? (
          <Spinner />
        ) : (
          <QuizList 
            quizzes={quizzes}
            isAdmin={true}
            onDelete={handleDeleteQuiz}
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

export default AdminDashboard;
