import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import dataService, { NewsData } from '../services/dataService';

const Hero: React.FC = () => {
  const [featuredArticles, setFeaturedArticles] = useState<NewsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    const fetchFeaturedArticles = async () => {
      try {
        setLoading(true);
        const articles = await dataService.fetchNewsData();
        // Get featured articles (breaking news and critical threats)
        const featured = articles
          .filter(article => article.breaking || article.threatLevel === 'critical' || article.featured)
          .slice(0, 3);
        
        // If not enough featured articles, fill with recent ones
        if (featured.length < 3) {
          const recent = articles
            .filter(article => !featured.some(f => f._id === article._id))
            .slice(0, 3 - featured.length);
          featured.push(...recent);
        }
        
        setFeaturedArticles(featured);
      } catch (error) {
        console.error('Error fetching featured articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedArticles();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };
  
  const handleSubscribe = async () => {
  if (!email || !email.includes('@')) {
    setMessage('⚠️ Please enter a valid email.');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const result = await response.json();

    if (response.ok) {
      setMessage('✅ Subscribed successfully!');
      setEmail('');
    } else {
      setMessage(`⚠️ ${result.message}`);
    }
  } catch (err) {
    console.error('Subscribe error:', err);
    setMessage('❌ Failed to subscribe. Please try again.');
  }
};



  const openArticle = (article: NewsData) => {
    if (article.sourceUrl && article.sourceUrl !== '#') {
      window.open(article.sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <section className="pt-20 lg:pt-24 pb-12 bg-gradient-to-br from-gray-50 to-white dark:from-dark-bg dark:to-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 animate-pulse">
              <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
            </div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const mainArticle = featuredArticles[0];
  const sideArticles = featuredArticles.slice(1, 3);

  if (!mainArticle) {
    return (
      <section className="pt-20 lg:pt-24 pb-12 bg-gradient-to-br from-gray-50 to-white dark:from-dark-bg dark:to-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Featured Articles Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for the latest cybersecurity news from your ML pipeline.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-20 lg:pt-24 pb-12 bg-gradient-to-br from-gray-50 to-white dark:from-dark-bg dark:to-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Featured Article */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <article 
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer"
              onClick={() => openArticle(mainArticle)}
            >
              {mainArticle.breaking && (
                <motion.div
                  className="absolute top-4 left-4 z-20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white animate-pulse">
                    <AlertTriangle className="h-3 w-3" />
                    <span>BREAKING</span>
                  </span>
                </motion.div>
              )}
              
              <div className="relative h-80 lg:h-96 overflow-hidden">
                <img
                  src={mainArticle.imageUrl}
                  alt={mainArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-cyber-green text-black">
                    {mainArticle.category.toUpperCase()}
                  </span>
                  <div className="flex items-center space-x-1 text-sm opacity-90">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(mainArticle.publishedAt)}</span>
                  </div>
                  {mainArticle.threatLevel && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      mainArticle.threatLevel === 'critical' ? 'bg-red-500 text-white' :
                      mainArticle.threatLevel === 'high' ? 'bg-orange-500 text-white' :
                      mainArticle.threatLevel === 'medium' ? 'bg-yellow-500 text-black' :
                      'bg-green-500 text-white'
                    }`}>
                      {mainArticle.threatLevel.toUpperCase()}
                    </span>
                  )}
                </div>
                
                <h2 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight">
                  {mainArticle.title}
                </h2>
                
                <p className="text-gray-200 mb-4 line-clamp-2">
                  {mainArticle.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">By {mainArticle.author.name}</span>
                  <motion.div
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-cyber-green text-black rounded-full font-medium hover:bg-cyber-green/90 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Read More</span>
                    <ExternalLink className="h-4 w-4" />
                  </motion.div>
                </div>
              </div>
            </article>
          </motion.div>

          {/* Side Articles */}
          <div className="space-y-6">
            {/* Trending Now Header */}
            <motion.div
              className="flex items-center space-x-2 mb-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <TrendingUp className="h-5 w-5 text-cyber-orange" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trending Now</h3>
            </motion.div>

            {sideArticles.map((article, index) => (
              <motion.article
                key={article._id}
                className="group bg-white dark:bg-dark-surface rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                onClick={() => openArticle(article)}
              >
                <div className="flex">
                  <div className="w-24 h-24 relative overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="flex-1 p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300">
                        {article.category.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(article.publishedAt)}
                      </span>
                      {article.threatLevel && (
                        <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                          article.threatLevel === 'critical' ? 'bg-red-500 text-white' :
                          article.threatLevel === 'high' ? 'bg-orange-500 text-white' :
                          article.threatLevel === 'medium' ? 'bg-yellow-500 text-black' :
                          'bg-green-500 text-white'
                        }`}>
                          {article.threatLevel.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-cyber-green transition-colors duration-200">
                      {article.title}
                    </h4>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {article.summary}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}

            {/* Newsletter Signup */}
            <motion.div
              className="bg-gradient-to-r from-cyber-green to-cyber-blue p-6 rounded-xl text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h4 className="font-bold mb-2">Stay Informed</h4>
              <p className="text-sm mb-4 opacity-90">Get the latest cybersecurity news from your ML pipeline delivered to your inbox.</p>
              <div className="flex space-x-2">
                <input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter your email"
  className="flex-1 px-3 py-2 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
/>
<motion.button
  onClick={handleSubscribe}
  className="px-4 py-2 bg-white text-cyber-green rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors duration-200"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Subscribe
</motion.button>

              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;