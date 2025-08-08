import { useEffect, useState } from 'react';

export type Category = {
  id: string;
  name: string;
  count: number;
  description: string;
  icon: string;
};

const categoryDescriptions: Record<string, string> = {
  "Breaking News": "Urgent incidents & alerts",
  "Threat Intelligence": "APT, malware & threat analysis",
  "Data Breaches": "Leaks, exposures & stolen data",
  "Policy & Compliance": "Regulations, audits, and laws",
  "Security Research": "Vulnerabilities, PoCs & CVEs",
  "Industry News": "Business, mergers & AI tools",
};

const categoryIcons: Record<string, string> = {
  "Breaking News": "AlertTriangle",
  "Threat Intelligence": "Shield",
  "Data Breaches": "Database",
  "Policy & Compliance": "FileText",
  "Security Research": "Search",
  "Industry News": "Building",
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/cyware_news.json')
      .then(res => res.json())
      .then(data => {
        const counts: Record<string, number> = {};
        for (const article of data) {
          const category = article.category || 'Uncategorized';
          counts[category] = (counts[category] || 0) + 1;
        }

        const final = Object.entries(counts).map(([name, count]) => ({
          id: name,
          name,
          count,
          description: categoryDescriptions[name] || "Cybersecurity articles in this domain.",
          icon: categoryIcons[name] || "Shield"
        }));

        setCategories(final);
      })
      .catch(err => console.error("Failed to fetch cyware_news.json:", err));
  }, []);

  return categories;
};
