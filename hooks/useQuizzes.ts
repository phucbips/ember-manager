import { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { getQuizzesQuery } from '../services/firebaseService';
import type { Quiz } from '../types';

export const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const quizzesQuery = getQuizzesQuery();
    
    const unsubscribe = onSnapshot(
      quizzesQuery,
      (snapshot) => {
        const quizData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Quiz));
        
        quizData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        
        setQuizzes(quizData);
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        console.error("Firestore listener error in useQuizzes:", err);
        setError(`Error loading data: ${err.message}`);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { quizzes, isLoading, error };
};
