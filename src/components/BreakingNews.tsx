import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, ExternalLink, Share2, Bookmark } from 'lucide-react';
import dataService, { NewsData } from '../services/dataService';

const BreakingNews: React.FC = () => {
  const [breakingNews, setBreakingNews] = useState<NewsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        setLoading(true);
        console.log('Fetching breaking news...');
        const breaking = await dataService.fetchBreakingNews();
        console.log('Breaking news fetched:', breaking.length);
        setBreakingNews(breaking.slice(0, 20));
      } catch (error) {
        console.error('Error fetching breaking news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakingNews();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchBreakingNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-red-50 dark:bg-red-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-red-50 dark:bg-red-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Breaking News
            </h1>
            <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Latest cybersecurity incidents and urgent security alerts from your ML pipeline
          </p>
          <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-700 dark:text-red-400 font-medium">
              Live Updates • {breakingNews.length} Articles
            </span>
          </div>
        </motion.div>

        {/* Breaking News Articles */}
        {breakingNews.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Breaking News
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No urgent cybersecurity alerts detected.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {breakingNews.map((article, index) => (
              <motion.article
                key={article._id}
                className="bg-white dark:bg-dark-bg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-red-500"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Breaking Badge */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white animate-pulse">
                          <AlertTriangle className="h-3 w-3" />
                          <span>BREAKING</span>
                        </span>
                        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(article.publishedAt)}</span>
                        </div>
                        {article.threatLevel && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            article.threatLevel === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            article.threatLevel === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                            article.threatLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {article.threatLevel.toUpperCase()}
                          </span>
                        )}
                      
                      </div>

                      {/* Title */}
                      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                        {article.title}
                      </h2>

                      {/* Summary */}
                      {article.summary && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                          {article.summary}
                        </p>
                      )}

                      {/* Tags */}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Source */}
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Source: {article.author.name} • {article.readTime} min read
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 ml-4">
                      <motion.button
                        onClick={() => toggleBookmark(article._id)}
                        className={`p-2 rounded-full transition-colors duration-200 ${
                          bookmarkedArticles.has(article._id)
                            ? 'bg-cyber-green text-black'
                            : 'bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-border'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Bookmark article"
                      >
                        <Bookmark className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => shareArticle(article)}
                        className="p-2 rounded-full bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-border transition-colors duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Share article"
                      >
                        <Share2 className="h-4 w-4" />
                      </motion.button>
                      <motion.a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>Read Full Story</span>
                        <ExternalLink className="h-4 w-4" />
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Auto-refresh notice */}
        <motion.div
          className="text-center mt-12 p-4 bg-gray-100 dark:bg-dark-surface rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            🔄 This page automatically refreshes every 5 minutes to bring you the latest breaking news from your ML pipeline
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default BreakingNews;