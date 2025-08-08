import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

interface CategoryGridProps {
  onCategoryClick: (categoryId: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategoryClick }) => {
  const categories = useCategories();

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent ? <IconComponent className="h-6 w-6" /> : <Icons.Shield className="h-6 w-6" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-16 bg-white dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore by Category
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Stay updated with the latest developments across all cybersecurity domains
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {categories
            .filter((category) => category.name.toLowerCase() !== 'uncategorized')
            .map((category) => (
              <motion.div
                key={category.name}
                className="group relative overflow-hidden bg-white dark:bg-dark-surface rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-dark-border cursor-pointer"
                variants={itemVariants}
                
              >
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-cyber-green/20 to-cyber-blue/20 text-cyber-green">
                      {getIcon(category.icon)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-cyber-green transition-colors duration-200">
                        {category.name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {category.count} articles
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-cyber-green/5 to-cyber-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryGrid;
