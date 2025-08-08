import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryGrid from './components/CategoryGrid';
import NewsGrid from './components/NewsGrid';
import ThreatDashboard from './components/ThreatDashboard';
import Footer from './components/Footer';
import BreakingNews from './components/BreakingNews';
import AnalysisSection from './components/AnalysisSection';
import ResourcesSection from './components/ResourcesSection';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    } else {
      setDarkMode(prefersDark); // 👈 Defaults to system preference
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);
  // 👇 Reset to home when search is cleared
useEffect(() => {
  if (activeSection === 'search') {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100); // slight delay to allow layout to paint
  }
}, [activeSection]);
useEffect(() => {
  if (searchQuery === '') {
    setActiveSection('home');
  }
}, [searchQuery]);
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    setCategoryFilter(undefined);

    const element = document.getElementById(section);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.offsetTop - headerHeight;

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    console.log('Category clicked:', categoryId);

    const categoryToSection: Record<string, string> = {
      'breaking': 'breaking',
      'threats': 'threats',
      'data-breaches': 'home',
      'policy': 'home',
      'research': 'analysis',
      'industry': 'home',
      'others': 'home', // ✅ Added others category
    };

    const targetSection = categoryToSection[categoryId] || 'home';

    if (targetSection === 'home') {
      setCategoryFilter(categoryId);
      setActiveSection('home');
    } else {
      setCategoryFilter(undefined);
      setActiveSection(targetSection);
    }

    setTimeout(() => {
      const element = document.getElementById(targetSection);
      if (element) {
        const headerHeight = 80;
        const elementPosition = element.offsetTop - headerHeight;

        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth',
        });
      }
    }, 100);
  };

  const renderActiveSection = () => {
  switch (activeSection) {
    case 'home':
      return (
        <>
          <Hero />
          <CategoryGrid onCategoryClick={handleCategoryClick} />
          <NewsGrid
            filterCategory={categoryFilter}
            onCategoryFilter={setCategoryFilter}
            searchQuery=""
          />
        </>
      );
    case 'breaking':
      return <BreakingNews />;
    case 'threats':
      return <ThreatDashboard />;
    case 'analysis':
      return <AnalysisSection />;
    case 'resources':
      return <ResourcesSection />;
    case 'search': // ✅ Add this case
      return (
        <>
          <NewsGrid
            filterCategory="all"
            searchQuery={searchQuery}
            onCategoryFilter={setCategoryFilter}
          />
        </>
      );
    default:
      return (
        <>
          <Hero />
          <CategoryGrid onCategoryClick={handleCategoryClick} />
          <NewsGrid
            filterCategory={categoryFilter}
            onCategoryFilter={setCategoryFilter}
            searchQuery=""
          />
        </>
      );
  }
};

  return (
    <motion.div
      className="min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-white transition-colors duration-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onSearch={(query) => {
  setSearchQuery(query);
  setActiveSection('search');
}}

      />

      <main>
        <section id="home" className={activeSection === 'home' ? 'block' : 'hidden'}>
          {activeSection === 'home' && (
            <>
              <Hero />
              <CategoryGrid onCategoryClick={handleCategoryClick} />
              <NewsGrid
              filterCategory={categoryFilter}
              onCategoryFilter={setCategoryFilter}
              searchQuery={searchQuery} // ✅ pass search query
              />
            </>
          )}
        </section>

        <section id="breaking" className={activeSection === 'breaking' ? 'block' : 'hidden'}>
          {activeSection === 'breaking' && <BreakingNews />}
        </section>

        <section id="threats" className={activeSection === 'threats' ? 'block' : 'hidden'}>
          {activeSection === 'threats' && <ThreatDashboard />}
        </section>

        <section id="analysis" className={activeSection === 'analysis' ? 'block' : 'hidden'}>
          {activeSection === 'analysis' && <AnalysisSection />}
        </section>

        <section id="resources" className={activeSection === 'resources' ? 'block' : 'hidden'}>
          {activeSection === 'resources' && <ResourcesSection />}
        </section>
        <section id="search" className={activeSection === 'search' ? 'block' : 'hidden'}>
  {activeSection === 'search' && (
    <NewsGrid
      searchQuery={searchQuery}
      filterCategory="all"
    />
  )}
</section>

      </main>

      <Footer />
    </motion.div>
  );
}

export default App;
