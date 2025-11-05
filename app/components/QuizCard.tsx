import React, { useState } from 'react';
import type { Quiz } from '../types';
import { formatDate, extractDomain } from '../utils';

interface QuizCardProps {
  quiz: Quiz;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onPreview: (url: string, title: string) => void;
  onCopy: (url: string) => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, isAdmin, onDelete, onPreview, onCopy }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(quiz.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCopy = async () => {
    await onCopy(quiz.quizUrl);
  };

  const domain = extractDomain(quiz.quizUrl);

  return (
    <div className={`bg-white rounded-lg border shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-300 ${
      isDeleting ? 'opacity-50' : ''
    }`}>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate" title={quiz.title}>
                {quiz.title}
              </h3>
              {domain && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                  {domain}
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500 break-all" title={quiz.quizUrl}>
                <span className="font-medium">URL:</span> {quiz.quizUrl.length > 80 ? `${quiz.quizUrl.substring(0, 80)}...` : quiz.quizUrl}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Created:</span> {formatDate(quiz.createdAt)}
              </p>
              {quiz.userId && (
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Owner:</span> {quiz.userId}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            <button
              onClick={handleCopy}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Copy URL to clipboard"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy URL
            </button>
            
            <button
              onClick={() => onPreview(quiz.quizUrl, quiz.title)}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Preview content"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </button>
            
            {isAdmin && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Delete quiz"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;