export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  imageUrl: string;
  readTime: number;
  featured?: boolean;
  breaking?: boolean;
}

export interface ThreatData {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  affectedSystems: string[];
  lastUpdated: string;
}

export interface NewsCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}