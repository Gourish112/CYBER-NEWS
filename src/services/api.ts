import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Article {
  _id: string;
  title: string;
  content: string;
  summary: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    expertise: string[];
  };
  sourceUrl: string;
  publishedAt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  readTime: number;
  featured: boolean;
  breaking: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  engagement: {
    views: number;
    shares: number;
    bookmarks: number;
  };
}

export interface ThreatIntelligence {
  _id: string;
  name: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedSystems: string[];
  lastUpdated: string;
  active: boolean;
}

export interface AnalyticsData {
  incidents_by_sector: Record<string, number>;
  threat_types: Record<string, number>;
  severity_distribution: Record<string, number>;
  trending_tags: Array<{ tag: string; count: number }>;
  total_articles: number;
  period: string;
}

// Articles API
export const articlesAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    featured?: boolean;
    breaking?: boolean;
    threatLevel?: string;
  }) => api.get<{ articles: Article[]; pagination: any }>('/articles', { params }),

  getById: (id: string) => api.get<Article>(`/articles/${id}`),

  create: (data: Partial<Article>) => api.post<Article>('/articles', data),

  update: (id: string, data: Partial<Article>) => api.put<Article>(`/articles/${id}`, data),

  delete: (id: string) => api.delete(`/articles/${id}`),

  bookmark: (id: string) => api.post(`/articles/${id}/bookmark`),

  share: (id: string) => api.post(`/articles/${id}/share`),
};

// Threats API
export const threatsAPI = {
  getAll: (params?: {
    type?: string;
    severity?: string;
    active?: boolean;
  }) => api.get<ThreatIntelligence[]>('/threats', { params }),

  getStats: () => api.get<{
    total: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
  }>('/threats/stats'),

  create: (data: Partial<ThreatIntelligence>) => api.post<ThreatIntelligence>('/threats', data),
};

// Analytics API
export const analyticsAPI = {
  getInsights: () => api.get<AnalyticsData>('/analytics/insights'),

  getTrends: () => api.get<{
    daily_stats: Array<{
      _id: string;
      count: number;
      categories: string[];
      threatLevels: string[];
    }>;
    period: string;
  }>('/analytics/trends'),
};

export default api;