import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import dataService, { NewsData, InsightsData } from '../services/dataService';

const AnalysisSection: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<NewsData[]>([]);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        const [allNews, insightsData] = await Promise.all([
          dataService.fetchNewsData(),
          dataService.fetchInsightsData()
        ]);
        
        const researchNews = dataService.filterNewsByCategory(allNews, 'research');
        setAnalysisData(researchNews.slice(0, 15));
        setInsights(insightsData);
      } catch (error) {
        console.error('Error fetching analysis data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-blue-50 dark:bg-blue-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-blue-50 dark:bg-blue-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Security Analysis
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            In-depth analysis and research on cybersecurity trends, vulnerabilities, and threat landscapes
          </p>
        </motion.div>

        {/* Insights Dashboard */}
        {insights && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Incidents by Sector */}
            <div className="bg-white dark:bg-dark-bg rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <PieChart className="h-6 w-6 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Incidents by Sector
                </h3>
              </div>
              <div className="space-y-3">
                {Object.entries(insights.incidents_by_sector).map(([sector, count]) => (
                  <div key={sector} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{sector}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Issues */}
            <div className="bg-white dark:bg-dark-bg rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="h-6 w-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Strategic Issues
                </h3>
              </div>
              <div className="space-y-3">
                {Object.entries(insights.strategic_issues).map(([issue, count]) => (
                  <div key={issue} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{issue}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* APTs Involved */}
            <div className="bg-white dark:bg-dark-bg rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Activity className="h-6 w-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  APTs Involved
                </h3>
              </div>
              <div className="space-y-3">
                {Object.entries(insights.apts_involved).map(([apt, count]) => (
                  <div key={apt} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{apt}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Research Articles */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {analysisData.map((article, index) => (
            <motion.article
              key={article.imageUrl}
              className="bg-white dark:bg-dark-bg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    RESEARCH
                  </span>
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

                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2">
                  {article.title}
                </h3>

                {article.summary && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {article.summary}
                  </p>
                )}

                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <motion.a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-500 hover:text-blue-600 font-medium"
                  whileHover={{ x: 5 }}
                >
                  Read Analysis →
                </motion.a>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {analysisData.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Analysis Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No research articles or analysis data available at this time.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnalysisSection;