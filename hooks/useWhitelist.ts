import { useState, useEffect, useCallback } from 'react';
import { 
  getWhitelist, 
  addToWhitelist, 
  removeFromWhitelist,
  clearWhitelistCache,
  getWhitelistCacheStats,
  type WhitelistError
} from './lib/whitelist-service';
import type { WhitelistEntry } from '../types';

interface UseWhitelistState {
  whitelist: WhitelistEntry[];
  isLoading: boolean;
  isAdding: boolean;
  isRemoving: boolean;
  error: string | null;
  lastUpdated: Date | null;
  cacheStats: ReturnType<typeof getWhitelistCacheStats> | null;
}

export const useWhitelist = (useCache: boolean = true) => {
  const [state, setState] = useState<UseWhitelistState>({
    whitelist: [],
    isLoading: true,
    isAdding: false,
    isRemoving: false,
    error: null,
    lastUpdated: null,
    cacheStats: null,
  });

  const updateState = useCallback((updates: Partial<UseWhitelistState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const loadWhitelist = useCallback(async (forceRefresh: boolean = false) => {
    try {
      updateState({ 
        isLoading: true, 
        error: null 
      });
      
      // Clear cache if force refresh
      if (forceRefresh) {
        clearWhitelistCache();
      }
      
      const data = await getWhitelist(useCache);
      updateState({ 
        whitelist: data, 
        isLoading: false,
        lastUpdated: new Date(),
        cacheStats: getWhitelistCacheStats()
      });
    } catch (err) {
      console.error("Error loading whitelist:", err);
      const errorMessage = err instanceof WhitelistError 
        ? err.userMessage 
        : err instanceof Error 
        ? err.message 
        : 'Failed to load whitelist';
      updateState({ 
        error: errorMessage, 
        isLoading: false 
      });
    }
  }, [useCache, updateState]);

  const handleAddToWhitelist = useCallback(async (emailOrDomain: string) => {
    try {
      updateState({ 
        isAdding: true, 
        error: null 
      });
      
      await addToWhitelist(emailOrDomain);
      
      // Refresh the list after adding
      await loadWhitelist(true); // Force refresh to get latest data
      
      updateState({ 
        isAdding: false,
        cacheStats: getWhitelistCacheStats()
      });
    } catch (err) {
      console.error("Error adding to whitelist:", err);
      const errorMessage = err instanceof WhitelistError 
        ? err.userMessage 
        : err instanceof Error 
        ? err.message 
        : 'Failed to add to whitelist';
      updateState({ 
        error: errorMessage, 
        isAdding: false 
      });
      throw err;
    }
  }, [loadWhitelist, updateState]);

  const handleRemoveFromWhitelist = useCallback(async (emailOrDomain: string) => {
    try {
      updateState({ 
        isRemoving: true, 
        error: null 
      });
      
      await removeFromWhitelist(emailOrDomain);
      
      // Update local state immediately for better UX
      setState(prev => ({
        ...prev,
        whitelist: prev.whitelist.filter(entry => 
          entry.email !== emailOrDomain && entry.domain !== emailOrDomain
        ),
        isRemoving: false,
        lastUpdated: new Date(),
        cacheStats: getWhitelistCacheStats()
      }));
    } catch (err) {
      console.error("Error removing from whitelist:", err);
      const errorMessage = err instanceof WhitelistError 
        ? err.userMessage 
        : err instanceof Error 
        ? err.message 
        : 'Failed to remove from whitelist';
      updateState({ 
        error: errorMessage, 
        isRemoving: false 
      });
      throw err;
    }
  }, [updateState]);

  const refetch = useCallback(() => {
    loadWhitelist(true); // Force refresh
  }, [loadWhitelist]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const clearCache = useCallback(() => {
    clearWhitelistCache();
    updateState({ cacheStats: getWhitelistCacheStats() });
  }, [updateState]);

  // Load whitelist on mount
  useEffect(() => {
    loadWhitelist();
  }, [loadWhitelist]);

  // Cleanup cache on unmount (optional - keep cache for better UX)
  useEffect(() => {
    return () => {
      // Optional: Clear cache on unmount if needed
      // clearWhitelistCache();
    };
  }, []);

  return {
    // Data
    whitelist: state.whitelist,
    
    // Loading states
    isLoading: state.isLoading,
    isAdding: state.isAdding,
    isRemoving: state.isRemoving,
    
    // Error handling
    error: state.error,
    clearError,
    
    // Cache management
    lastUpdated: state.lastUpdated,
    cacheStats: state.cacheStats,
    clearCache,
    
    // Actions
    addToWhitelist: handleAddToWhitelist,
    removeFromWhitelist: handleRemoveFromWhitelist,
    refetch,
  };
};