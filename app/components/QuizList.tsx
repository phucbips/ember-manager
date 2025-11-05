import React, { useState, useMemo } from 'react';
import type { Quiz } from '../types';
import QuizCard from './QuizCard';
import { debounce } from '../utils';

interface QuizListProps {
  quizzes: Quiz[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onPreview: (url: string, title: string) => void;
  onCopy: (url: string) => void;
}

const QuizList: React.FC<QuizListProps> = ({ 
  quizzes, 
  isAdmin, 
  onDelete, 
  onPreview, 
  onCopy 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedQuizzes = useMemo(() => {
    let filtered = quizzes;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.quizUrl.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort quizzes
    return filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        const comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });
  }, [quizzes, searchQuery, sortBy, sortOrder]);

  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setSearchQuery(value), 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearch(e.target.value);
  };

  if (quizzes.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-lg border">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No quizzes found
        </h3>
        <p className="text-gray-500">
          {searchQuery 
            ? "Try adjusting your search terms." 
            : "Create your first quiz embed to get started."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Sort Controls */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search quizzes..."
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'title' | 'createdAt')}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt">Sort by Date</option>
              <option value="title">Sort by Title</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        
        {/* Results count */}
        <div className="text-sm text-gray-600">
          Showing {filteredAndSortedQuizzes.length} of {quizzes.length} quizzes
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      </div>

      {/* Quiz Grid/List */}
      <div id="quiz-list" className="space-y-4">
        {filteredAndSortedQuizzes.map((quiz) => (
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

      {filteredAndSortedQuizzes.length === 0 && searchQuery && (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <div className="text-2xl mb-2">🔍</div>
          <p className="text-gray-500">No quizzes found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default QuizList;