import { Article, ThreatData, NewsCategory } from '../types';

export const categories: NewsCategory[] = [
  {
    id: 'breaking',
    name: 'Breaking News',
    description: 'Latest cybersecurity incidents and alerts',
    icon: 'AlertTriangle',
    count: 12
  },
  {
    id: 'threats',
    name: 'Threat Intelligence',
    description: 'Advanced persistent threats and malware analysis',
    icon: 'Shield',
    count: 28
  },
  {
    id: 'data-breaches',
    name: 'Data Breaches',
    description: 'Corporate security incidents and data leaks',
    icon: 'Database',
    count: 15
  },
  {
    id: 'policy',
    name: 'Policy & Compliance',
    description: 'Regulatory updates and compliance requirements',
    icon: 'FileText',
    count: 8
  },
  {
    id: 'research',
    name: 'Security Research',
    description: 'Vulnerability discoveries and security research',
    icon: 'Search',
    count: 22
  },
  {
    id: 'industry',
    name: 'Industry News',
    description: 'Market updates and company announcements',
    icon: 'Building',
    count: 18
  }
];

export const featuredArticles: Article[] = [
  {
    id: '1',
    title: 'Critical Zero-Day Vulnerability Discovered in Popular IoT Framework',
    description: 'Security researchers have identified a previously unknown vulnerability affecting millions of IoT devices worldwide, prompting immediate patching recommendations.',
    content: 'A critical zero-day vulnerability has been discovered in the widely-used OpenIoT framework...',
    author: 'Sarah Chen',
    publishedAt: '2025-01-09T08:00:00Z',
    category: 'breaking',
    tags: ['Zero-Day', 'IoT', 'Vulnerability'],
    imageUrl: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg',
    readTime: 4,
    featured: true,
    breaking: true
  },
  {
    id: '2',
    title: 'Advanced Ransomware Group Targets Healthcare Sector with New Encryption Method',
    description: 'A sophisticated ransomware operation has been targeting healthcare institutions using previously unseen encryption techniques.',
    content: 'Healthcare organizations across multiple countries are facing a new wave of ransomware attacks...',
    author: 'Marcus Rodriguez',
    publishedAt: '2025-01-09T06:30:00Z',
    category: 'threats',
    tags: ['Ransomware', 'Healthcare', 'Encryption'],
    imageUrl: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg',
    readTime: 6,
    featured: true
  },
  {
    id: '3',
    title: 'Major Cloud Provider Experiences Security Incident Affecting Millions',
    description: 'A leading cloud service provider has disclosed a security incident that potentially exposed customer data across multiple regions.',
    content: 'In a statement released today, CloudTech Corporation acknowledged a security breach...',
    author: 'Elena Vasquez',
    publishedAt: '2025-01-08T22:15:00Z',
    category: 'data-breaches',
    tags: ['Cloud Security', 'Data Breach', 'Privacy'],
    imageUrl: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg',
    readTime: 5,
    featured: true
  }
];

export const recentArticles: Article[] = [
  {
    id: '4',
    title: 'New EU Cybersecurity Directive Introduces Stricter Requirements for Critical Infrastructure',
    description: 'The European Union has finalized new cybersecurity regulations that will significantly impact how critical infrastructure operators manage security.',
    content: 'The European Union has introduced comprehensive cybersecurity legislation...',
    author: 'Dr. James Mitchell',
    publishedAt: '2025-01-08T14:20:00Z',
    category: 'policy',
    tags: ['EU Regulation', 'Critical Infrastructure', 'Compliance'],
    imageUrl: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
    readTime: 7
  },
  {
    id: '5',
    title: 'AI-Powered Phishing Attacks Reach New Level of Sophistication',
    description: 'Cybercriminals are leveraging artificial intelligence to create highly convincing phishing campaigns that bypass traditional security measures.',
    content: 'The integration of artificial intelligence into cybercriminal operations...',
    author: 'Dr. Priya Sharma',
    publishedAt: '2025-01-08T11:45:00Z',
    category: 'threats',
    tags: ['AI', 'Phishing', 'Social Engineering'],
    imageUrl: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    readTime: 5
  },
  {
    id: '6',
    title: 'Quantum Computing Breakthrough Poses New Challenges for Encryption',
    description: 'Recent advances in quantum computing technology are accelerating the timeline for post-quantum cryptography adoption.',
    content: 'A breakthrough in quantum computing has researchers and security experts...',
    author: 'Prof. Alan Zhang',
    publishedAt: '2025-01-07T16:30:00Z',
    category: 'research',
    tags: ['Quantum Computing', 'Encryption', 'Cryptography'],
    imageUrl: 'https://images.pexels.com/photos/3861387/pexels-photo-3861387.jpeg',
    readTime: 8
  },
  {
    id: '7',
    title: 'Supply Chain Attack Targets Software Development Tools',
    description: 'A sophisticated supply chain attack has been discovered targeting popular development environments used by thousands of companies.',
    content: 'Security researchers have uncovered a complex supply chain attack...',
    author: 'Lisa Park',
    publishedAt: '2025-01-07T13:15:00Z',
    category: 'threats',
    tags: ['Supply Chain', 'Developer Tools', 'Malware'],
    imageUrl: 'https://images.pexels.com/photos/270632/pexels-photo-270632.jpeg',
    readTime: 6
  }
];

export const threatData: ThreatData[] = [
  {
    id: '1',
    name: 'APT-42 Campaign',
    severity: 'critical',
    type: 'Advanced Persistent Threat',
    affectedSystems: ['Windows', 'Linux', 'IoT Devices'],
    lastUpdated: '2025-01-09T10:00:00Z'
  },
  {
    id: '2',
    name: 'CryptoLocker Variant',
    severity: 'high',
    type: 'Ransomware',
    affectedSystems: ['Windows', 'Network Storage'],
    lastUpdated: '2025-01-09T08:30:00Z'
  },
  {
    id: '3',
    name: 'PhishKit-2024',
    severity: 'medium',
    type: 'Phishing Toolkit',
    affectedSystems: ['Email Systems', 'Web Browsers'],
    lastUpdated: '2025-01-08T15:45:00Z'
  }
];