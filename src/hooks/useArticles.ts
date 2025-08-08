import { useState, useEffect } from 'react';
import { articlesAPI, Article } from '../services/api';

interface UseArticlesOptions {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  breaking?: boolean;
  threatLevel?: string;
}

export const useArticles = (options: UseArticlesOptions = {}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await articlesAPI.getAll(options);
      setArticles(response.data.articles);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [
    options.page,
    options.limit,
    options.category,
    options.search,
    options.featured,
    options.breaking,
    options.threatLevel,
  ]);

  const refetch = () => {
    fetchArticles();
  };

  return {
    articles,
    loading,
    error,
    pagination,
    refetch,
  };
};

export const useArticle = (id: string) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await articlesAPI.getById(id);
        setArticle(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch article');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  return { article, loading, error };
};