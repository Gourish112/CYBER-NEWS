import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Shield, Activity, Database, Zap } from 'lucide-react';
import dataService, { NewsData, InsightsData } from '../services/dataService';

const ThreatDashboard: React.FC = () => {
  const [threatData, setThreatData] = useState<NewsData[]>([]);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreatData = async () => {
      try {
        setLoading(true);
        console.log('Fetching threat intelligence data...');
        
        const [threats, insightsData] = await Promise.all([
          dataService.fetchArticlesByCategory('threats'),
          dataService.fetchInsightsData()
        ]);
        
        console.log('Threat data fetched:', threats.length);
        console.log('Threat Levels:', threatData.map(t => t.threatLevel));
        setThreatData(threats.slice(0, 10));
        setInsights(insightsData);
      } catch (error) {
        console.error('Error fetching threat data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThreatData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 border-red-500/20';
      case 'high': return 'bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 border-green-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const threatStats = [
    { 
      label: 'Active Threats', 
      value: threatData.length.toString(), 
      icon: AlertTriangle, 
      color: 'text-red-500' 
    },
    { 
      label: 'Critical Level Threats', 
      value: threatData.filter(t => t.threatLevel?.toLowerCase().trim() === 'critical').length.toString(),
      icon: TrendingUp, 
      color: 'text-orange-500' 
    },
    { 
      label: 'Articles Analyzed', 
      value: insights?.total_articles?.toString() || '0', 
      icon: Database, 
      color: 'text-blue-500' 
    },
    { 
      label: 'Auto-Updated', 
      value: '24/7', 
      icon: Zap, 
      color: 'text-green-500' 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-cyber-green" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Threat Intelligence Dashboard
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Real-time threat monitoring and analysis powered by machine learning. Stay ahead of cyber threats with actionable insights and automated detection.
          </p>
        </motion.div>

        {/* Threat Statistics */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {threatStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white dark:bg-dark-bg rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-border"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-100 dark:bg-dark-card ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Insights Dashboard */}
        {insights && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Threat Types */}
            <div className="bg-white dark:bg-dark-bg rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Threat Types Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(insights.threat_types || {}).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{type}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Severity Distribution */}
            <div className="bg-white dark:bg-dark-bg rounded-xl p-6 shadow-lg">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
    Severity Levels
  </h3>
  <div className="space-y-3">
    {['critical', 'high', 'medium', 'low', 'unknown'].map((severity) => {
      const count = insights.severity_distribution[severity] || 0;
      return (
        <div key={severity} className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${getSeverityColor(severity)}`}></span>
            <span className="text-gray-600 dark:text-gray-400 capitalize">{severity}</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
        </div>
      );
    })}
  </div>
</div>


            {/* Trending Tags */}
            <div className="bg-white dark:bg-dark-bg rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Trending Threats
              </h3>
              <div className="space-y-3">
                {insights.trending_tags?.slice(0, 5).map((tag) => (
                  <div key={tag.tag} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">#{tag.tag}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{tag.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Threats */}
        <motion.div
          className="bg-white dark:bg-dark-bg rounded-xl shadow-lg border border-gray-200 dark:border-dark-border overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Active Threats</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Threats detected and analyzed by machine learning algorithms.
                </p>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 dark:text-green-400 text-sm font-medium">Live</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-dark-border">
            {threatData.length === 0 ? (
              <div className="p-8 text-center">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Active Threats
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Your ML pipeline hasn't detected any active threats at this time.
                </p>
              </div>
            ) : (
              threatData.map((threat, index) => (
                <motion.div
                  key={threat._id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-dark-card transition-colors duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {threat.title}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityBg(threat.threatLevel)}`}>
                          <span className={`w-2 h-2 rounded-full mr-1.5 ${getSeverityColor(threat.threatLevel)}`}></span>
                          {threat.threatLevel.toUpperCase()}
                        </span>
                        
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Category: {threat.category} • Source: {threat.author.name}
                      </p>
                      
                      {threat.summary && (
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {threat.summary}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {threat.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 rounded text-xs bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Detected: {new Date(threat.publishedAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <motion.a
                      href={threat.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 px-4 py-2 bg-cyber-green text-black rounded-lg font-medium hover:bg-cyber-green/90 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Details
                    </motion.a>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {[
            { 
              title: 'ML Pipeline Status', 
              description: 'Monitor your ML pipeline performance', 
              icon: Database,
              status: 'Active'
            },
            { 
              title: 'Threat Feed API', 
              description: 'Access real-time threat intelligence', 
              icon: Zap,
              status: 'Available'
            },
            { 
              title: 'Auto-Analysis', 
              description: 'Automated threat categorization', 
              icon: Activity,
              status: 'Running'
            },
          ].map((action, index) => (
            <motion.div
              key={action.title}
              className="bg-gradient-to-r from-cyber-green/10 to-cyber-blue/10 rounded-xl p-6 border border-cyber-green/20 hover:border-cyber-green/40 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-cyber-green/20">
                    <action.icon className="h-5 w-5 text-cyber-green" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {action.title}
                  </h4>
                </div>
                <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  {action.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {action.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ThreatDashboard;