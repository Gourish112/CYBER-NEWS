import express from 'express';
import jsonDataService from '../services/jsonDataService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @swagger
 * /api/analytics/insights:
 *   get:
 *     summary: Get cybersecurity insights from ML pipeline JSON files
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Analytics insights from ML pipeline
 */
router.get('/insights', async (req, res) => {
  try {
    logger.info('Fetching analytics insights from ML pipeline data');
    
    const insights = jsonDataService.getInsightsData();
    
    if (!insights) {
      return res.status(404).json({ 
        message: 'No insights data available from ML pipeline' 
      });
    }

    logger.info('Returning analytics insights');
    res.json(insights);
  } catch (error) {
    logger.error('Error fetching insights:', error);
    res.status(500).json({ 
      message: 'Error fetching analytics insights from ML pipeline',
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /api/analytics/trends:
 *   get:
 *     summary: Get trending topics from ML pipeline data
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Trending data from ML pipeline
 */
router.get('/trends', async (req, res) => {
  try {
    logger.info('Generating trends from ML pipeline data');
    
    const newsData = jsonDataService.getNewsData();
    
    // Generate daily stats from the data
    const dailyStats = [];
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Count articles for this day
      const dayArticles = newsData.filter(article => {
        const articleDate = new Date(article.publishedAt).toISOString().split('T')[0];
        return articleDate === dateString;
      });
      
      const categories = [...new Set(dayArticles.map(a => a.category))];
      const threatLevels = [...new Set(dayArticles.map(a => a.threatLevel))];
      
      dailyStats.push({
        _id: dateString,
        count: dayArticles.length,
        categories,
        threatLevels
      });
    }

    // Get trending categories
    const categoryCounts = newsData.reduce((acc, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1;
      return acc;
    }, {});

    // Get trending tags
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

    const response = {
      daily_stats: dailyStats,
      trending_categories: categoryCounts,
      trending_tags: trendingTags,
      period: '7 days',
      total_articles_analyzed: newsData.length,
      data_source: 'ML Pipeline JSON Files',
      last_updated: new Date().toISOString()
    };

    logger.info('Returning trends data');
    res.json(response);
  } catch (error) {
    logger.error('Error fetching trends:', error);
    res.status(500).json({ 
      message: 'Error fetching trends data from ML pipeline',
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     summary: Get summary statistics from ML pipeline
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Summary statistics
 */
router.get('/summary', async (req, res) => {
  try {
    logger.info('Generating summary statistics');
    
    const stats = jsonDataService.getStats();
    const insights = jsonDataService.getInsightsData();
    
    const summary = {
      ...stats,
      insights_summary: {
        total_sectors_affected: Object.keys(insights.incidents_by_sector || {}).length,
        total_threat_types: Object.keys(insights.threat_types || {}).length,
        critical_threats: stats.threatLevelCounts.critical || 0,
        active_apts: Object.values(insights.apts_involved || {}).reduce((a, b) => a + b, 0)
      },
      ml_pipeline_status: {
        active: true,
        last_processed: new Date().toISOString(),
        processing_mode: 'Real-time JSON monitoring'
      }
    };

    logger.info('Returning summary statistics');
    res.json(summary);
  } catch (error) {
    logger.error('Error generating summary:', error);
    res.status(500).json({ 
      message: 'Error generating summary statistics',
      error: error.message 
    });
  }
});

export default router;