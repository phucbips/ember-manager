import React from 'react';
import type { Quiz } from '../types';
import QuizCard from './QuizCard';

interface QuizListProps {
  quizzes: Quiz[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onPreview: (url: string, title: string) => void;
  onCopy: (url: string) => void;
}

const QuizList: React.FC<QuizListProps> = ({ quizzes, isAdmin, onDelete, onPreview, onCopy }) => {
  if (quizzes.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No content available to display.</p>
      </div>
    );
  }

  return (
    <div id="quiz-list" className="space-y-6">
      {quizzes.map((quiz) => (
        <QuizCard 
          key={quiz.id} 
          quiz={quiz} 
          isAdmin={isAdmin}
          onDelete={onDelete} 
          onPreview={onPreview} 
          onCopy={onCopy} 
        />
      ))}
    </div>
  );
};

export default QuizList;
