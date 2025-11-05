import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export const extractSrcAndTitle = (embedCode: string): { src: string; title: string } => {
  const srcMatch = embedCode.match(/src="([^"]*)"/);
  const titleMatch = embedCode.match(/title="([^"]*)"/);

  if (!srcMatch || !srcMatch[1]) {
    throw new Error("Could not find a valid 'src' attribute in the embed code.");
  }

  const src = srcMatch[1];
  const title = titleMatch && titleMatch[1] ? titleMatch[1] : "Untitled Content";

  return { src, title };
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};