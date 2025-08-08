import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import { config } from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class JSONDataService {
  constructor() {
    this.dataCache = new Map();
    this.lastModified = new Map();
    this.watchedFiles = new Set();
    this.setupFileWatchers();
  }

  setupFileWatchers() {
    const publicDir = path.join(__dirname, '../../public');
    
    // Watch for changes in JSON files
    [config.newsDataFile, config.insightsDataFile].forEach(filename => {
      const filePath = path.join(publicDir, filename);
      
      if (fs.existsSync(filePath)) {
        fs.watchFile(filePath, (curr, prev) => {
          if (curr.mtime !== prev.mtime) {
            logger.info(`JSON file updated: ${filename}`);
            this.invalidateCache(filename);
          }
        });
        this.watchedFiles.add(filePath);
      }
    });
  }

  invalidateCache(filename) {
    this.dataCache.delete(filename);
    this.lastModified.delete(filename);
  }

  readJSONFile(filename) {
    try {
      const filePath = path.join(__dirname, '../../public', filename);
      
      if (!fs.existsSync(filePath)) {
        logger.warn(`JSON file not found: ${filename}`);
        return null;
      }

      const stats = fs.statSync(filePath);
      const lastMod = this.lastModified.get(filename);
      
      // Check if we have cached data and file hasn't changed
      if (this.dataCache.has(filename) && lastMod && lastMod >= stats.mtime) {
        return this.dataCache.get(filename);
      }

      // Read and parse file
      const data = fs.readFileSync(filePath, 'utf8');
      const parsedData = JSON.parse(data);
      
      // Cache the data
      this.dataCache.set(filename, parsedData);
      this.lastModified.set(filename, stats.mtime);
      
      logger.info(`Loaded JSON file: ${filename} (${Array.isArray(parsedData) ? parsedData.length : 'object'} items)`);
      return parsedData;
    } catch (error) {
      logger.error(`Error reading JSON file ${filename}:`, error);
      return null;
    }
  }

  getNewsData() {
    const rawData = this.readJSONFile(config.newsDataFile);
    if (!rawData || !Array.isArray(rawData)) {
      return [];
    }

    return rawData.map((item, index) => this.enrichArticleData(item, index));
  }

  getInsightsData() {
    const data = this.readJSONFile(config.insightsDataFile);
    if (!data) {
      // Generate basic insights from news data if insights file doesn't exist
      return this.generateInsightsFromNews();
    }
    return data;
  }

  enrichArticleData(item, index) {
    // Map the new category structure to our frontend categories
    const category = this.mapCategory(item.category);
    const threatLevel = this.calculateThreatLevel(item.title || '', item.summary || '', item.entities);
    const tags = this.extractTags(item.title || '', item.summary || '', item.entities);
    
    // Generate a proper date if missing
    const publishedAt = item.date || new Date().toISOString();
    
    return {
      _id: `ml_${index}_${Date.now()}`,
      title: item.title || 'Untitled',
      summary: item.summary || '',
      content: item.summary || item.title || '',
      sourceUrl: item.link || '#',
      publishedAt: publishedAt,
      category,
      tags,
      threatLevel,
      breaking: this.isBreaking(item.title, item.summary, item.category),
      featured: threatLevel === 'critical' || category === 'breaking',
      imageUrl: this.getImageForCategory(category),
      author: {
        _id: item.source ? item.source.toLowerCase().replace(/\s+/g, '_') : 'ml_pipeline',
        name: item.source,
        expertise: ['cybersecurity', 'threat-intelligence', 'news-reporting']
      },
      engagement: {
        views: Math.floor(Math.random() * 1000) + 100,
        shares: Math.floor(Math.random() * 100) + 10,
        bookmarks: Math.floor(Math.random() * 50) + 5
      },
      readTime: this.calculateReadTime(item.summary || item.title || ''),
      scrapedAt: new Date().toISOString(),
      mlProcessed: true,
      entities: item.entities || {},
      source: item.source || 'Unknown Source'
    };
  }

  mapCategory(originalCategory) {
    if (!originalCategory) return 'others';
    
    const categoryMap = {
      'Breaking News': 'breaking',
      'Threat Intelligence': 'threats',
      'Data Breaches': 'data-breaches',
      'Policy & Compliance': 'policy',
      'Security Research': 'research',
      'Industry News': 'industry',
      'Uncategorized': 'others'
    };
    
    return categoryMap[originalCategory] || 'industry';
  }

  calculateThreatLevel(title, summary, entities) {
    const text = (title + ' ' + summary).toLowerCase();
    
    // Check for CVEs - high priority
    if (entities?.CVE && entities.CVE.length > 0) {
      // If multiple CVEs or high CVSS scores mentioned
      if (entities.CVE.length > 1 || text.includes('critical') || text.includes('10.0') || text.includes('9.')) {
        return 'critical';
      }
      return 'high';
    }
    
    // Check for APTs
    if (entities?.APT && entities.APT.length > 0) {
      return 'high';
    }
    
    // Critical indicators
    const criticalIndicators = [
      'zero-day', 'critical vulnerability', 'nation-state', 'supply chain attack',
      'critical infrastructure', 'emergency patch', 'actively exploited', 'root access'
    ];
    
    const highIndicators = [
      'ransomware', 'data breach', 'apt', 'advanced persistent threat',
      'targeted attack', 'sophisticated malware', 'major breach', 'exploit'
    ];
    
    const lowIndicators = [
      'patch', 'update', 'advisory', 'recommendation', 'awareness',
      'best practice', 'guidance', 'minor', 'low risk'
    ];
    
    if (criticalIndicators.some(indicator => text.includes(indicator))) {
      return 'critical';
    }
    if (highIndicators.some(indicator => text.includes(indicator))) {
      return 'high';
    }
    if (lowIndicators.some(indicator => text.includes(indicator))) {
      return 'low';
    }
    
    return 'medium';
  }

  isBreaking(title, summary, category) {
    if (category === 'Breaking News') return true;
    
    const text = (title + ' ' + summary).toLowerCase();
    const breakingIndicators = [
      'breaking', 'urgent', 'alert', 'emergency', 'immediate',
      'just disclosed', 'just released', 'just discovered'
    ];
    
    return breakingIndicators.some(indicator => text.includes(indicator));
  }

  extractTags(title, summary, entities) {
    const tags = new Set();
    
    // Add CVE tags
    if (entities?.CVE) {
      entities.CVE.forEach(cve => tags.add(cve));
    }
    
    // Add APT tags
    if (entities?.APT) {
      entities.APT.forEach(apt => tags.add(apt));
    }
    
    // Add organization tags (limit to avoid clutter)
    if (entities?.ORG) {
      entities.ORG.slice(0, 3).forEach(org => {
        if (org.length > 2 && org.length < 20) { // Filter out very short or long org names
          tags.add(org);
        }
      });
    }
    
    // Add sector tags
    if (entities?.Sector) {
      entities.Sector.forEach(sector => tags.add(sector));
    }
    
    // Extract common cybersecurity terms from text
    const text = (title + ' ' + summary).toLowerCase();
    const cybersecurityTerms = [
      'malware', 'ransomware', 'phishing', 'vulnerability', 'exploit',
      'breach', 'hack', 'cyber', 'security', 'threat', 'attack', 'ddos',
      'botnet', 'trojan', 'virus', 'zero-day', 'patch', 'firewall',
      'encryption', 'authentication', 'compliance', 'gdpr', 'hipaa'
    ];
    
    cybersecurityTerms.forEach(term => {
      if (text.includes(term)) {
        tags.add(term);
      }
    });
    
    return Array.from(tags).slice(0, 8); // Limit to 8 tags
  }

  calculateReadTime(content) {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  getImageForCategory(category) {
    const images = {
      breaking: 'https://img.freepik.com/free-vector/blue-breaking-news-tv-background_1017-14201.jpg?semt=ais_hybrid',
      threats: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg',
      'data-breaches': 'https://img.freepik.com/free-photo/computer-monitor-showing-hacked-system-alert-message-flashing-screen-dealing-with-hacking-cyber-crime-attack-display-with-security-breach-warning-malware-threat-close-up_482257-62207.jpg?semt=ais_hybrid&w=740',
      policy: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
      research: 'https://img.freepik.com/free-vector/futuristic-science-lab-background_23-2148505015.jpg?semt=ais_hybrid&w=740',
      industry: 'https://img.freepik.com/free-photo/technician-remotely-supervising-smart-factory-production-lines_482257-126922.jpg?semt=ais_hybrid&w=740',
      others: 'https://img.freepik.com/free-photo/html-css-collage-concept-with-hacker_23-2150061984.jpg?semt=ais_hybrid&w=740'
    };
    
    return images[category] || images.industry;
  }

  generateInsightsFromNews() {
    const newsData = this.getNewsData();
    
    const insights = {
      incidents_by_sector: {
        'Healthcare': 0,
        'Finance': 0,
        'Government': 0,
        'Retail': 0,
        'Technology': 0,
        'Energy': 0
      },
      threat_types: {
        'Ransomware': 0,
        'Data Breaches': 0,
        'Phishing': 0,
        'Malware': 0,
        'APT': 0,
        'Vulnerability': 0
      },
      severity_distribution: {
        'low': 0,
        'medium': 0,
        'high': 0,
        'critical': 0
      },
      apts_involved: {
        'APT29': 0,
        'APT41': 0,
        'Lazarus Group': 0,
        'APT28': 0,
        'Carbanak': 0
      },
      strategic_issues: {
        'Data Breaches': 0,
        'Ransomware': 0,
        'Phishing': 0,
        'Supply Chain': 0,
        'Zero-Day': 0
      }
    };

    // Analyze news data
    newsData.forEach(article => {
      const text = (article.title + ' ' + article.summary).toLowerCase();
      
      // Count by sector using entities
      if (article.entities?.Sector) {
        article.entities.Sector.forEach(sector => {
          const sectorKey = sector.charAt(0).toUpperCase() + sector.slice(1);
          if (insights.incidents_by_sector[sectorKey] !== undefined) {
            insights.incidents_by_sector[sectorKey]++;
          }
        });
      }

      // Count by threat type
      if (text.includes('ransomware')) insights.threat_types['Ransomware']++;
      if (text.includes('breach') || text.includes('leak')) insights.threat_types['Data Breaches']++;
      if (text.includes('phishing')) insights.threat_types['Phishing']++;
      if (text.includes('malware')) insights.threat_types['Malware']++;
      if (article.entities?.APT && article.entities.APT.length > 0) insights.threat_types['APT']++;
      if (text.includes('vulnerability') || article.entities?.CVE?.length > 0) insights.threat_types['Vulnerability']++;

      // Count by severity
      if (['low', 'medium', 'high', 'critical'].includes(article.threatLevel)) {
  insights.severity_distribution[article.threatLevel]++;
} else {
  insights.severity_distribution['medium']++; // default fallback
}

      // Count APTs from entities
      if (article.entities?.APT) {
        article.entities.APT.forEach(apt => {
          if (insights.apts_involved[apt] !== undefined) {
            insights.apts_involved[apt]++;
          }
        });
      }

      // Count strategic issues
      if (text.includes('breach')) insights.strategic_issues['Data Breaches']++;
      if (text.includes('ransomware')) insights.strategic_issues['Ransomware']++;
      if (text.includes('phishing')) insights.strategic_issues['Phishing']++;
      if (text.includes('supply chain')) insights.strategic_issues['Supply Chain']++;
      if (text.includes('zero-day')) insights.strategic_issues['Zero-Day']++;
    });

    // Add metadata
    const tagCounts = {};
    newsData.forEach(article => {
      article.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const trendingTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      ...insights,
      trending_tags: trendingTags,
      total_articles: newsData.length,
      period: '30 days',
      last_updated: new Date().toISOString(),
      data_source: 'ML Pipeline JSON Files'
    };
  }

  // Filter methods
  filterByCategory(category) {
    const allNews = this.getNewsData();
    if (category === 'all') return allNews;
    return allNews.filter(article => article.category === category);
  }

  getBreakingNews() {
    const allNews = this.getNewsData();
    return allNews.filter(article => 
      article.breaking || 
      article.threatLevel === 'critical' ||
      article.category === 'breaking'
    );
  }

  searchArticles(query) {
    const allNews = this.getNewsData();
    const searchLower = query.toLowerCase();
    
    return allNews.filter(article =>
      article.title.toLowerCase().includes(searchLower) ||
      article.summary.toLowerCase().includes(searchLower) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  getStats() {
    const newsData = this.getNewsData();
    const insights = this.getInsightsData();
    
    return {
      totalArticles: newsData.length,
      categoryCounts: newsData.reduce((acc, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1;
        return acc;
      }, {}),
      threatLevelCounts: newsData.reduce((acc, article) => {
        acc[article.threatLevel] = (acc[article.threatLevel] || 0) + 1;
        return acc;
      }, {}),
      breakingNewsCount: newsData.filter(a => a.breaking).length,
      lastUpdated: new Date().toISOString(),
      dataSource: 'ML Pipeline JSON Files'
    };
  }

  // Cleanup method
  cleanup() {
    this.watchedFiles.forEach(filePath => {
      fs.unwatchFile(filePath);
    });
    this.watchedFiles.clear();
    this.dataCache.clear();
    this.lastModified.clear();
  }
}

export default new JSONDataService();