import React from 'react';
import type { Quiz } from '../types';

interface QuizCardProps {
  quiz: Quiz;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onPreview: (url: string, title: string) => void;
  onCopy: (url: string) => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, isAdmin, onDelete, onPreview, onCopy }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center transition hover:shadow-lg hover:border-indigo-300">
      <div className="mb-4 sm:mb-0 sm:mr-4 flex-grow min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate" title={quiz.title}>
          {quiz.title}
        </h3>
        <p className="text-sm text-gray-500 break-all" title={quiz.quizUrl}>
          URL: {quiz.quizUrl.length > 60 ? `${quiz.quizUrl.substring(0, 60)}...` : quiz.quizUrl}
        </p>
      </div>
      <div className="flex space-x-2 sm:space-x-3 flex-shrink-0">
        <button
          onClick={() => onCopy(quiz.quizUrl)}
          className="bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Copy URL
        </button>
        <button
          onClick={() => onPreview(quiz.quizUrl, quiz.title)}
          className="bg-green-500 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-green-600 transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Preview
        </button>
        {isAdmin && (
            <button
            onClick={() => onDelete(quiz.id)}
            className="bg-red-500 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-red-600 transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
            Delete
            </button>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
