import type { User } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export interface Quiz {
  id: string;
  title: string;
  embedCode: string;
  quizUrl: string;
  createdAt: Timestamp;
  ownerId: string;
}

export type QuizData = Omit<Quiz, 'id'>;

export interface NotificationMessage {
  message: string;
  type: 'success' | 'error';
}

export type { User };
