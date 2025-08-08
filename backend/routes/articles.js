import express from 'express';
import jsonDataService from '../services/jsonDataService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get articles from ML pipeline JSON files with filtering and pagination
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of articles per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and summary
 *       - in: query
 *         name: breaking
 *         schema:
 *           type: boolean
 *         description: Filter breaking news
 *       - in: query
 *         name: threatLevel
 *         schema:
 *           type: string
 *         description: Filter by threat level
 *     responses:
 *       200:
 *         description: List of articles from ML pipeline JSON files
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      breaking,
      threatLevel
    } = req.query;

    logger.info(`Fetching articles: page=${page}, limit=${limit}, category=${category}, search=${search}`);

    // Get articles from JSON data service
    let articles = jsonDataService.getNewsData();

    // Apply filters
    if (category && category !== 'all') {
      articles = articles.filter(article => article.category === category);
    }
    
    if (search) {
      articles = jsonDataService.searchArticles(search);
    }
    
    if (breaking === 'true') {
      articles = articles.filter(article => article.breaking);
    }
    
    if (threatLevel) {
      articles = articles.filter(article => article.threatLevel === threatLevel);
    }

    // Sort by date (newest first)
    articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedArticles = articles.slice(startIndex, endIndex);

    logger.info(`Returning ${paginatedArticles.length} articles out of ${articles.length} total`);

    res.json({
      articles: paginatedArticles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: articles.length,
        pages: Math.ceil(articles.length / limit)
      },
      metadata: {
        dataSource: 'ML Pipeline JSON Files',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching articles from JSON:', error);
    res.status(500).json({ 
      message: 'Error fetching articles from ML pipeline JSON files',
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Get article by ID from ML pipeline JSON files
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Article ID
 *     responses:
 *       200:
 *         description: Article details
 *       404:
 *         description: Article not found
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const articles = jsonDataService.getNewsData();
    
    const article = articles.find(a => a._id === id);
    
    if (article) {
      // Increment view count (simulated)
      article.engagement.views += 1;
      
      logger.info(`Article found: ${article.title}`);
      res.json(article);
    } else {
      logger.warn(`Article not found: ${id}`);
      res.status(404).json({ message: 'Article not found' });
    }
  } catch (error) {
    logger.error('Error fetching article by ID:', error);
    res.status(500).json({ 
      message: 'Error fetching article',
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /api/articles/breaking/latest:
 *   get:
 *     summary: Get latest breaking news from ML pipeline
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: Latest breaking news articles
 */
router.get('/breaking/latest', async (req, res) => {
  try {
    const breakingNews = jsonDataService.getBreakingNews()
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 20);

    logger.info(`Returning ${breakingNews.length} breaking news articles`);

    res.json(breakingNews);
  } catch (error) {
    logger.error('Error fetching breaking news:', error);
    res.status(500).json({ 
      message: 'Error fetching breaking news from ML pipeline',
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /api/articles/category/{category}:
 *   get:
 *     summary: Get articles by category from ML pipeline
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Article category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of articles to return
 *     responses:
 *       200:
 *         description: Articles in the specified category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;

    const articles = jsonDataService.filterByCategory(category)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, parseInt(limit));

    logger.info(`Returning ${articles.length} articles for category: ${category}`);

    res.json({
      articles,
      category,
      total: articles.length,
      metadata: {
        dataSource: 'ML Pipeline JSON Files',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error(`Error fetching articles for category ${req.params.category}:`, error);
    res.status(500).json({ 
      message: `Error fetching articles for category ${req.params.category}`,
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /api/articles/stats:
 *   get:
 *     summary: Get article statistics from ML pipeline
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: Article statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = jsonDataService.getStats();
    
    logger.info('Returning article statistics');
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching article stats:', error);
    res.status(500).json({ 
      message: 'Error fetching article statistics',
      error: error.message 
    });
  }
});

// Engagement endpoints (simulated)
router.post('/:id/bookmark', async (req, res) => {
  try {
    const { id } = req.params;
    const articles = jsonDataService.getNewsData();
    const article = articles.find(a => a._id === id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    article.engagement.bookmarks += 1;
    
    res.json({ 
      bookmarks: article.engagement.bookmarks,
      message: 'Article bookmarked successfully'
    });
  } catch (error) {
    logger.error('Error bookmarking article:', error);
    res.status(500).json({ message: 'Error bookmarking article' });
  }
});

router.post('/:id/share', async (req, res) => {
  try {
    const { id } = req.params;
    const articles = jsonDataService.getNewsData();
    const article = articles.find(a => a._id === id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    article.engagement.shares += 1;
    
    res.json({ 
      shares: article.engagement.shares,
      message: 'Article shared successfully'
    });
  } catch (error) {
    logger.error('Error sharing article:', error);
    res.status(500).json({ message: 'Error sharing article' });
  }
});

export default router;