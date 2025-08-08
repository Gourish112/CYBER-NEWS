import React from 'react';
import { motion } from 'framer-motion';
import { Shield, BookOpen, PenTool as Tool, AlertTriangle, FileText, Zap, Download, ExternalLink, Users, Globe, Lock, Database } from 'lucide-react';

const ResourcesSection: React.FC = () => {
  const resourceCategories = [
    {
      title: "Threat Intelligence Feeds",
      description: "Real-time threat data and indicators of compromise",
      icon: Shield,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      resources: [
        { name: "MITRE ATT&CK Framework", url: "https://attack.mitre.org", type: "external" },
        { name: "NIST Cybersecurity Framework", url: "https://nist.gov/cyberframework", type: "external" },
        { name: "CISA Known Exploited Vulnerabilities", url: "https://cisa.gov/kev", type: "external" },
        { name: "CVE Database", url: "https://cve.mitre.org", type: "external" }
      ]
    },
    {
      title: "Security Tools",
      description: "Curated list of essential cybersecurity tools",
      icon: Tool,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      resources: [
        { name: "Nmap Network Scanner", url: "https://nmap.org", type: "external" },
        { name: "Wireshark Protocol Analyzer", url: "https://wireshark.org", type: "external" },
        { name: "Metasploit Framework", url: "https://metasploit.com", type: "external" },
        { name: "OWASP ZAP", url: "https://zaproxy.org", type: "external" }
      ]
    },
    {
      title: "Training Materials",
      description: "Educational resources and certification guides",
      icon: BookOpen,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      resources: [
        { name: "CISSP Study Guide", url: "https://www.isc2.org/certifications/cissp/cissp-self-study-resources", type: "external" },
        { name: "CEH Practice Tests", url: "https://www.eccouncil.org/train-certify/ceh-assessment/", type: "external" },
        { name: "Security+ Training Videos", url: "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/", type: "external" },
        { name: "Cybersecurity Fundamentals", url: "https://www.eccouncil.org/train-certify/fundamentals/", type: "external" }
      ]
    }
  ];

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BookOpen className="h-8 w-8 text-cyber-green" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Resources & Tools
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Essential cybersecurity resources, tools, and educational content to enhance your security posture
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
        </motion.div>

        {/* Resource Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resourceCategories.map((category, index) => (
            <motion.div
              key={category.title}
              className="bg-white dark:bg-dark-bg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="p-6">
                {/* Category Header */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${category.bgColor} mb-4`}>
                  <category.icon className={`h-6 w-6 ${category.color}`} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {category.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {category.description}
                </p>

                {/* Resources List */}
                <div className="space-y-3">
                  {category.resources.map((resource, resourceIndex) => (
                    <motion.a
                      key={resource.name}
                      href={resource.url}
                      target={resource.type === 'external' ? '_blank' : '_self'}
                      rel={resource.type === 'external' ? 'noopener noreferrer' : ''}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-dark-card transition-colors duration-200"
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-gray-900 dark:text-white font-medium">
                        {resource.name}
                      </span>
                      {resource.type === 'download' ? (
                        <Download className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                      )}
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourcesSection;