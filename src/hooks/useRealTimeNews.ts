import { useState, useEffect, useCallback } from 'react';
import { grokAI, GeminiNewsItem, GeminiResponse } from '../lib/geminiNews';

export interface UseRealTimeNewsOptions {
  location?: string;
  refreshInterval?: number; // in milliseconds
  autoRefresh?: boolean;
  category?: string;
}

export interface UseRealTimeNewsReturn {
  news: GeminiNewsItem[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
  searchNews: (query: string) => Promise<void>;
}

export const useRealTimeNews = (options: UseRealTimeNewsOptions = {}): UseRealTimeNewsReturn => {
  const {
    location = 'Kolkata',
    refreshInterval = 2 * 60 * 1000, // 2 minutes default
    autoRefresh = true,
    category
  } = options;

  const [news, setNews] = useState<GeminiNewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchNews = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response: GeminiResponse = await grokAI.fetchRealTimeNews(location, forceRefresh);
      
      if (response.success) {
        let filteredNews = response.data;
        
        // Filter by category if specified
        if (category) {
          filteredNews = response.data.filter(item => item.category === category);
        }

        setNews(filteredNews);
        setLastUpdated(response.lastUpdated);
      } else {
        setError(response.error || 'Failed to fetch news');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [location, category]);

  const refresh = useCallback(async () => {
    await fetchNews(true);
  }, [fetchNews]);

  const searchNews = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);

      const response: GeminiResponse = await grokAI.searchNews(query, category);
      
      if (response.success) {
        setNews(response.data);
        setLastUpdated(response.lastUpdated);
      } else {
        setError(response.error || 'Search failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search error occurred');
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Initial fetch
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchNews(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchNews]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setNews([]);
      setError(null);
      setLastUpdated(null);
    };
  }, []);

  return {
    news,
    loading,
    error,
    lastUpdated,
    refresh,
    searchNews
  };
};

// Hook for location-based news
export const useLocationBasedNews = (latitude?: number, longitude?: number): UseRealTimeNewsReturn => {
  const [news, setNews] = useState<GeminiNewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchLocationNews = useCallback(async () => {
    if (!latitude || !longitude) {
      setError('Location coordinates required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response: GeminiResponse = await grokAI.getLocationBasedNews(latitude, longitude);
      
      if (response.success) {
        setNews(response.data);
        setLastUpdated(response.lastUpdated);
      } else {
        setError(response.error || 'Failed to fetch location-based news');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude]);

  const refresh = useCallback(async () => {
    await fetchLocationNews();
  }, [fetchLocationNews]);

  const searchNews = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const response = await grokAI.searchNews(query);
      if (response.success) {
        setNews(response.data);
        setLastUpdated(response.lastUpdated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocationNews();
  }, [fetchLocationNews]);

  return {
    news,
    loading,
    error,
    lastUpdated,
    refresh,
    searchNews
  };
};
