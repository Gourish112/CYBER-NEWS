// Service to handle JSON data fetching and processing from backend API
export interface NewsData {
  _id: string;
  title: string;
  summary: string;
  content: string;
  sourceUrl: string;
  publishedAt: string;
  category: string;
  threatLevel: string;
  tags: string[];
  breaking: boolean;
  featured: boolean;
  imageUrl: string;
  author: {
    _id: string;
    name: string;
    expertise: string[];
  };
  engagement: {
    views: number;
    shares: number;
    bookmarks: number;
  };
  readTime: number;
}

export interface InsightsData {
  incidents_by_sector: Record<string, number>;
  apts_involved: Record<string, number>;
  strategic_issues: Record<string, number>;
  threat_types: Record<string, number>;
  severity_distribution: Record<string, number>;
  trending_tags: Array<{ tag: string; count: number }>;
  total_articles: number;
  period: string;
}

class DataService {
  private static instance: DataService;
  private newsCache: NewsData[] = [];
  private insightsCache: InsightsData | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly API_BASE_URL = 'http://localhost:5000/api';

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  async fetchNewsData(): Promise<NewsData[]> {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (this.newsCache.length > 0 && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.newsCache;
    }

    try {
      console.log('Fetching news data from backend API...');
      const response = await fetch(`${this.API_BASE_URL}/articles?limit=50`);
      
      if (response.ok) {
        const data = await response.json();
        this.newsCache = data.articles;
        this.lastFetch = now;
        console.log(`Fetched ${this.newsCache.length} articles from backend`);
        return this.newsCache;
      } else {
        console.error('Failed to fetch from backend API:', response.status);
      }
    } catch (error) {
      console.error('Error fetching from backend API:', error);
    }

    // Fallback: try to fetch directly from JSON file
    try {
      console.log('Falling back to direct JSON file access...');
      const response = await fetch('/cyware_news.json');
      if (response.ok) {
        const jsonData = await response.json();
        this.newsCache = jsonData.map((item: any, index: number) => ({
          _id: `json_${index}`,
          title: item.title || '',
          summary: item.summary || '',
          content: item.summary || item.title || '',
          sourceUrl: item.link || '',
          publishedAt: item.date || new Date().toISOString(),
          category: this.categorizeNews(item.title + ' ' + item.summary),
          threatLevel: item.threatLevel || 'medium',
          tags: this.extractTags(item.title + ' ' + item.summary),
          breaking: this.isBreaking(item.title + ' ' + item.summary),
          featured: false,
          imageUrl: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg',
          author: {
            _id: 'ml_pipeline',
            name: item.source,
            expertise: ['cybersecurity', 'threat-intelligence']
          },
          engagement: {
            views: Math.floor(Math.random() * 1000),
            shares: Math.floor(Math.random() * 100),
            bookmarks: Math.floor(Math.random() * 50)
          },
          readTime: Math.ceil((item.summary || item.title || '').split(' ').length / 200) || 3
        }));
        this.lastFetch = now;
        console.log(`Fetched ${this.newsCache.length} articles from JSON file`);
        return this.newsCache;
      }
    } catch (error) {
      console.error('Failed to fetch JSON data:', error);
    }

    return [];
  }

  async fetchInsightsData(): Promise<InsightsData | null> {
    try {
      console.log('Fetching insights data from backend API...');
      const response = await fetch(`${this.API_BASE_URL}/analytics/insights`);
      if (response.ok) {
        const data = await response.json();
        this.insightsCache = data;
        console.log('Fetched insights from backend');
        return data;
      }
    } catch (error) {
      console.error('Failed to fetch insights from API:', error);
    }

    // Fallback to JSON file
    try {
      console.log('Falling back to insights JSON file...');
      const response = await fetch('cyber_news_insights.json');
      if (response.ok) {
        const data = await response.json();
        this.insightsCache = data;
        console.log('Fetched insights from JSON file');
        return data;
      }
    } catch (error) {
      console.error('Failed to fetch insights JSON:', error);
    }

    return null;
  }

  async fetchBreakingNews(): Promise<NewsData[]> {
    try {
      console.log('Fetching breaking news from backend API...');
      const response = await fetch(`${this.API_BASE_URL}/articles/breaking/latest`);
      if (response.ok) {
        const data = await response.json();
        console.log(`Fetched ${data.length} breaking news articles`);
        return data;
      }
    } catch (error) {
      console.error('Failed to fetch breaking news from API:', error);
    }

    // Fallback: filter from all news
    const allNews = await this.fetchNewsData();
    return allNews.filter(article => article.breaking || article.threatLevel === 'critical');
  }

  async fetchArticlesByCategory(category: string): Promise<NewsData[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/articles?category=${category}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        return data.articles;
      }
    } catch (error) {
      console.error(`Failed to fetch ${category} articles:`, error);
    }

    // Fallback: filter from all news
    const allNews = await this.fetchNewsData();
    return allNews.filter(article => article.category === category);
  }

  private categorizeNews(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('breaking') || lowerText.includes('urgent') || lowerText.includes('alert')) {
      return 'breaking';
    }
    if (lowerText.includes('apt') || lowerText.includes('malware') || lowerText.includes('threat actor')) {
      return 'threats';
    }
    if (lowerText.includes('breach') || lowerText.includes('leak') || lowerText.includes('exposed')) {
      return 'data-breaches';
    }
    if (lowerText.includes('regulation') || lowerText.includes('compliance') || lowerText.includes('policy')) {
      return 'policy';
    }
    if (lowerText.includes('research') || lowerText.includes('vulnerability') || lowerText.includes('cve')) {
      return 'research';
    }
    if (lowerText.includes('cybersecurity market') ||
    lowerText.includes('acquisition') ||
    lowerText.includes('partnership') ||
    lowerText.includes('funding') ||
    lowerText.includes('industry report') ||
    lowerText.includes('market share'))
    {
    return 'industry';
    }
    return 'others';
  }

  private calculateThreatLevel(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('zero-day') || lowerText.includes('critical') || lowerText.includes('nation-state')) {
      return 'critical';
    }
    if (lowerText.includes('ransomware') || lowerText.includes('breach') || lowerText.includes('exploit')) {
      return 'high';
    }
    if (lowerText.includes('patch') || lowerText.includes('update') || lowerText.includes('advisory')) {
      return 'low';
    }
    
    return 'medium';
  }

  private isBreaking(text: string): boolean {
    const lowerText = text.toLowerCase();
    return lowerText.includes('breaking') || lowerText.includes('urgent') || lowerText.includes('alert');
  }

  private extractTags(text: string): string[] {
    const lowerText = text.toLowerCase();
    const tags: string[] = [];
    
    const tagKeywords = [
      'malware', 'ransomware', 'phishing', 'apt', 'vulnerability', 'exploit',
      'breach', 'hack', 'cyber', 'security', 'threat', 'attack', 'ddos',
      'botnet', 'trojan', 'virus', 'zero-day', 'patch', 'firewall'
    ];
    
    tagKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    return tags.slice(0, 5);
  }

  // Filter methods
  filterNewsByCategory(news: NewsData[], category: string): NewsData[] {
    if (category === 'all') return news;
    return news.filter(item => item.category === category);
  }

  getBreakingNews(news: NewsData[]): NewsData[] {
    return news.filter(item => item.breaking || item.threatLevel === 'critical');
  }

  getThreatIntelligence(news: NewsData[]): NewsData[] {
    return news.filter(item => item.category === 'threats');
  }

  getResearchArticles(news: NewsData[]): NewsData[] {
    return news.filter(item => item.category === 'research');
  }
}

export default DataService.getInstance();