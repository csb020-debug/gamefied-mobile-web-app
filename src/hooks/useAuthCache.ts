import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: 'school_admin' | 'teacher' | 'student';
  school_id?: string;
  is_active: boolean;
}

interface CachedAuthData {
  user: User | null;
  userProfile: UserProfile | null;
  timestamp: number;
}

const CACHE_KEY = 'auth_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAuthCache = () => {
  const [cachedData, setCachedData] = useState<CachedAuthData | null>(null);

  useEffect(() => {
    loadFromCache();
  }, []);

  const loadFromCache = () => {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const data: CachedAuthData = JSON.parse(stored);
        
        // Check if cache is still valid
        if (Date.now() - data.timestamp < CACHE_DURATION) {
          setCachedData(data);
          return data;
        } else {
          // Clear expired cache
          localStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to load auth cache:', error);
      localStorage.removeItem(CACHE_KEY);
    }
    return null;
  };

  const saveToCache = (user: User | null, userProfile: UserProfile | null) => {
    try {
      const data: CachedAuthData = {
        user,
        userProfile,
        timestamp: Date.now()
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      setCachedData(data);
    } catch (error) {
      console.warn('Failed to save auth cache:', error);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    setCachedData(null);
  };

  const isValidCache = (data: CachedAuthData | null): boolean => {
    if (!data) return false;
    return Date.now() - data.timestamp < CACHE_DURATION;
  };

  return {
    cachedData,
    loadFromCache,
    saveToCache,
    clearCache,
    isValidCache
  };
};