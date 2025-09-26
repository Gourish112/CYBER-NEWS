import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/config.js';
import logger from './utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import articlesRouter from './routes/articles.js';
import analyticsRouter from './routes/analytics.js';
import emailService from './utils/emailService.js';
import { spawn } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

// ✅ ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Initialize app
const app = express();
app.set('trust proxy', 1);

// -----------------------------------------------------------
// GLOBAL MIDDLEWARE
// -----------------------------------------------------------
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindow * 60 * 1000,
  max: config.rateLimitMax,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', generalLimiter);

// -----------------------------------------------------------
// SUBSCRIBER FUNCTIONALITY
// -----------------------------------------------------------
const subscribersFile = path.join(__dirname, 'subscribers.json');

// Ensure subscribers.json exists
if (!fs.existsSync(subscribersFile)) {
  fs.writeFileSync(subscribersFile, '[]', 'utf-8');
}

// -----------------------------------------------------------
// PYTHON PIPELINE CRON JOB (FIXED)
// -----------------------------------------------------------
import cron from 'node-cron';

// -----------------------------------------------------------
// PYTHON PIPELINE CRON JOB (TWICE A DAY)
// -----------------------------------------------------------
let pythonProcess = null;

const runPythonScript = () => {
  if (pythonProcess) {
    logger.warn('Killing previous pipeline process to prevent memory leak...');
    pythonProcess.kill('SIGTERM');
  }

  logger.info('Starting main_pipeline.py...');
  pythonProcess = spawn('python', ['model_pipeline/main_pipeline.py'], {
    cwd: path.join(__dirname), // run from backend dir
    detached: false
  });

  pythonProcess.stdout.on('data', (data) => {
    const line = data.toString();
    const safeLine = line.length > 500 ? line.substring(0, 500) + '... [truncated]' : line;
    logger.info(`Python stdout: ${safeLine}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    const line = data.toString();
    const safeLine = line.length > 500 ? line.substring(0, 500) + '... [truncated]' : line;
    logger.error(`Python stderr: ${safeLine}`);
  });

  pythonProcess.on('error', (err) => {
    logger.error(`Python process failed: ${err.message}`);
  });

  pythonProcess.on('close', (code) => {
    logger.info(`main_pipeline.py exited with code ${code}`);
    pythonProcess = null;
  });
};

// Run immediately on server startup (optional, you can remove this if you only want cron)
runPythonScript();

// Schedule: run at 00:00 and 12:00 every day
cron.schedule('0 0,12 * * *', () => {
  logger.info('⏰ Scheduled run: main_pipeline.py starting...');
  runPythonScript();
});

// -----------------------------------------------------------
// SUBSCRIBE / UNSUBSCRIBE ROUTES
// -----------------------------------------------------------
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    let subscribers = [];
    try {
      subscribers = JSON.parse(fs.readFileSync(subscribersFile, 'utf-8'));
    } catch {
      logger.warn('subscribers.json corrupted, resetting file.');
      subscribers = [];
    }

    if (subscribers.includes(email)) {
      return res.status(409).json({ message: 'Email already subscribed' });
    }

    subscribers.push(email);
    fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2), 'utf-8');

    const emailResult = await emailService.sendWelcomeEmail(email);
    if (emailResult.success) {
      return res.status(200).json({ message: 'Successfully subscribed and welcome email sent!' });
    } else {
      return res.status(200).json({ message: 'Subscribed but failed to send welcome email.', emailError: emailResult.error });
    }
  } catch (err) {
    logger.error('Subscription error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/unsubscribe', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    let subscribers = JSON.parse(fs.readFileSync(subscribersFile, 'utf-8'));
    const initialLength = subscribers.length;

    subscribers = subscribers.filter(sub => sub !== email);

    if (subscribers.length === initialLength) {
      return res.status(404).json({ message: 'Email not found in subscriber list.' });
    }

    fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2), 'utf-8');

    const emailResult = await emailService.sendUnsubscribeConfirmation(email);
    if (emailResult.success) {
      return res.status(200).json({ message: 'Successfully unsubscribed and confirmation email sent!' });
    } else {
      return res.status(200).json({ message: 'Unsubscribed but failed to send confirmation email.', emailError: emailResult.error });
    }
  } catch (err) {
    logger.error('Unsubscribe error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// -----------------------------------------------------------
// API ROUTES
// -----------------------------------------------------------
app.use('/api/articles', articlesRouter);
app.use('/api/analytics', analyticsRouter);

// -----------------------------------------------------------
// SWAGGER DOCUMENTATION
// -----------------------------------------------------------
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CyberWatch API',
      version: '1.0.0',
      description: 'Comprehensive API for cybersecurity news aggregation',
      contact: { name: 'CyberWatch Team', email: 'api@cyberwatch.com' }
    },
    servers: [{ url: `http://localhost:${config.port}`, description: 'Local dev' }]
  },
  apis: ['./routes/*.js', './app.js']
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CyberWatch API Docs'
}));

// -----------------------------------------------------------
// HEALTHCHECK
// -----------------------------------------------------------
app.get('/api/health', (req, res) => {
  const memory = process.memoryUsage();
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
    },
  });
});

app.get('/api', (req, res) => {
  res.send('OK');
});

// 404 fallback
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

// -----------------------------------------------------------
// ERROR HANDLING
// -----------------------------------------------------------
app.use((err, req, res, next) => {
  logger.error(`Unhandled Error: ${err.message}`);
  res.status(500).json({ message: err.message });
});

// -----------------------------------------------------------
// START SERVER
// -----------------------------------------------------------
const PORT = config.port || 5000;
const server = app.listen(PORT, () => {
  logger.info(`🚀 CyberWatch API running at http://localhost:${PORT}`);
});
