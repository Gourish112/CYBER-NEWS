import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, Tag, Share2, Bookmark, ExternalLink } from 'lucide-react';
import dataService, { NewsData } from '../services/dataService';

interface NewsGridProps {
  filterCategory?: string;
  onCategoryFilter?: (category: string) => void;
  searchQuery?: string; // ✅ new
}


const NewsGrid: React.FC<NewsGridProps> = ({ filterCategory, onCategoryFilter, searchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState(filterCategory || 'all');
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());
  const [articles, setArticles] = useState<NewsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxArticlesReached, setMaxArticlesReached] = useState(false);
  const categories = ['all', 'threats', 'policy', 'research', 'data-breaches', 'breaking', 'industry', 'others'];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        console.log('Fetching articles for category:', selectedCategory);
        
        if (selectedCategory === 'all') {
          const fetchedArticles = await dataService.fetchNewsData();
          setArticles(fetchedArticles);
          setMaxArticlesReached(true); // all loaded
        } else {
          const fetchedArticles = await dataService.fetchArticlesByCategory(selectedCategory);
          setArticles(fetchedArticles);
          setMaxArticlesReached(true); // all loaded per category
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [selectedCategory]);

  useEffect(() => {
    if (filterCategory && filterCategory !== selectedCategory) {
      setSelectedCategory(filterCategory);
    }
  }, [filterCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (onCategoryFilter) {
      onCategoryFilter(category);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const toggleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(articleId)) {
        newBookmarks.delete(articleId);
      } else {
        newBookmarks.add(articleId);
      }
      return newBookmarks;
    });
  };

  const shareArticle = (article: NewsData) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: article.sourceUrl,
      });
    } else {
      navigator.clipboard.writeText(article.sourceUrl);
    }
  };

  const openArticle = (article: NewsData) => {
    if (article.sourceUrl && article.sourceUrl !== '#') {
      window.open(article.sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };
  const filteredArticles = articles.filter((article) =>
  article.title.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
  article.summary.toLowerCase().includes(searchQuery?.toLowerCase() || '')
);

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-8 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!filterCategory && (
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Latest News & Analysis
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              In-depth coverage of cybersecurity threats, trends, and industry developments
            </p>
          </motion.div>
        )}

        {/* Category Filter - only show if not filtering by specific category */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-cyber-green text-black shadow-lg'
                  : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
            </motion.button>
          ))}
        </motion.div>


        {/* Articles Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          layout
        >
          <AnimatePresence mode="popLayout">
            
            {filteredArticles.map((article, index) => (
              <motion.article
                key={article._id}
                className="group bg-white dark:bg-dark-bg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                layout
                whileHover={{ y: -5 }}
                onClick={() => openArticle(article)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-black/70 text-white">
                      {article.category.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(article._id);
                      }}
                      className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-200 ${
                        bookmarkedArticles.has(article._id)
                          ? 'bg-cyber-green text-black'
                          : 'bg-black/50 text-white hover:bg-black/70'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Bookmark article"
                    >
                      <Bookmark className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareArticle(article);
                      }}
                      className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Share article"
                    >
                      <Share2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                  {/* Threat Level Badge */}
                  {article.threatLevel && (
                    <div className="absolute bottom-4 left-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        article.threatLevel === 'critical' ? 'bg-red-500 text-white' :
                        article.threatLevel === 'high' ? 'bg-orange-500 text-white' :
                        article.threatLevel === 'medium' ? 'bg-yellow-500 text-black' :
                        'bg-green-500 text-white'
                      }`}>
                        {article.threatLevel.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{article.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(article.publishedAt)}</span>
                      </div>
                    </div>
                    <span className="text-cyber-green font-medium">{article.readTime} min read</span>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-cyber-green transition-colors duration-200">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {article.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {article.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center space-x-1 px-2 py-1 rounded text-xs bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300"
                        >
                          <Tag className="h-2 w-2" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>

                    <motion.div
                      className="inline-flex items-center space-x-1 text-cyber-green hover:text-cyber-green/80 font-medium transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Read More</span>
                      <ExternalLink className="h-4 w-4" />
                    </motion.div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* No Articles Message */}
        {articles.length === 0 && !loading && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Articles Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No articles found for the selected category. Try selecting a different category or check back later.
            </p>
          </motion.div>
        )}

        {/* Load More Button */}
        {articles.length > 0 && (
  <motion.div
    className="text-center mt-12"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.4 }}
  >
    {maxArticlesReached ? (
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        ✅ No more articles to load.
      </p>
    ) : (
      <motion.button
        className="px-8 py-3 bg-cyber-green text-black font-semibold rounded-full hover:bg-cyber-green/90 transition-colors duration-200 shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Load More Articles
      </motion.button>
    )}
  </motion.div>
)}


      </div>
    </section>
  );
};

export default NewsGrid;