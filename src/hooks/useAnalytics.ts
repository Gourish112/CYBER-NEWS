import { useState, useEffect } from 'react';
import { analyticsAPI, AnalyticsData } from '../services/api';

export const useAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await analyticsAPI.getInsights();
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const refetch = async () => {
    try {
      setError(null);
      const response = await analyticsAPI.getInsights();
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    }
  };

  return { data, loading, error, refetch };
};