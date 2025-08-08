import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173'
  },
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15, // minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100, // requests per window
  email: {
    provider: process.env.EMAIL_PROVIDER || 'gmail', // gmail, outlook, smtp, sendgrid, mailgun
    user: process.env.EMAIL_USER ,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    
    // For SendGrid/Mailgun
    apiKey: process.env.EMAIL_API_KEY,
    
    // For custom SMTP
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  },
  // JSON file paths
  newsDataFile: process.env.NEWS_DATA_FILE || 'cyware_news.json',
  insightsDataFile: process.env.INSIGHTS_DATA_FILE || 'cyber_news_insights.json',
  
  // ML Pipeline settings
  mlPipelineRefreshInterval: parseInt(process.env.ML_REFRESH_INTERVAL) || 300000, // 5 minutes
  maxArticlesPerCategory: parseInt(process.env.MAX_ARTICLES_PER_CATEGORY) || 50,
};