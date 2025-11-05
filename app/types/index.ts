import { type ClassValue, clsx } from "clsx"

export interface Quiz {
  id: string;
  title: string;
  embedCode: string;
  quizUrl: string;
  createdAt: string; // Changed from Timestamp to string for Supabase
  ownerId: string; // Supabase user ID
  userId?: string; // Legacy field for compatibility
  ownerEmail?: string;
}

export type QuizData = Omit<Quiz, 'id'>;

export interface NotificationMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface QuizFilters {
  userId?: string;
  sortBy?: 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
}

export interface WhitelistEntry {
  id: string;
  email: string;
  addedAt: string;
  domain?: string;
  ownerId?: string;
}

export type WhitelistData = Omit<WhitelistEntry, 'id'>;

export type UserRoleType = 'admin' | 'moderator' | 'user' | 'guest';
export type UserStatusType = 'active' | 'inactive' | 'suspended' | 'pending';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRoleType;
  status: UserStatusType;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  loginCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  preferenceKey: string;
  preferenceValue: any;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: string;
  role: UserRoleType;
  resource: string;
  action: string;
  isAllowed: boolean;
  createdAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  deviceInfo?: any;
  ipAddress?: string;
  lastActivity: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role: UserRoleType;
  status: UserStatusType;
  lastLoginAt?: string;
  loginCount: number;
  isActive: boolean;
  permissions: string[];
}

// Legacy interface for backward compatibility
export interface LegacyUserRole {
  isAdmin: boolean;
  isWhitelisted: boolean;
  email: string;
}

// New enhanced UserRole interface with caching metadata
export interface UserRole extends LegacyUserRole {
  lastChecked?: number;
  source: 'cache' | 'database';
  isValid: boolean;
}

// Admin cache related types
export interface AdminCacheEntry {
  isAdmin: boolean;
  isWhitelisted: boolean;
  timestamp: number;
  email: string;
}

export interface AdminCacheStats {
  size: number;
  entries: Array<{
    email: string;
    isAdmin: boolean;
    isWhitelisted: boolean;
    age: number;
  }>;
  lastCleanup?: number;
  totalRequests: number;
  cacheHitRate: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

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