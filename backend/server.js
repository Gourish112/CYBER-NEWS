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
import emailService from './utils/emailService.js'; // Import the email service
import { spawn } from 'child_process';
// ✅ dotenv for .env loading
import dotenv from 'dotenv';
dotenv.config();

// ✅ ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Initialize app
const app = express();

// -----------------------------------------------------------
// GLOBAL MIDDLEWARE
// -----------------------------------------------------------
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
const runPythonScript = () => {
  logger.info('Starting main_pipeline.py...');
  const pythonProcess = spawn('python', ['model_pipeline/main_pipeline.py']);

  pythonProcess.stdout.on('data', (data) => {
    logger.info(`Python stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    logger.error(`Python stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    logger.info(`main_pipeline.py exited with code ${code}`);
    if (code !== 0) {
      logger.error(`main_pipeline.py failed with exit code: ${code}`);
    }
  });
};
runPythonScript();

// Schedule the script to run every 10 minutes
setInterval(runPythonScript, 10 * 60 * 1000);
/**
 * @swagger
 * /api/subscribe:
 * post:
 * summary: Subscribe to the newsletter
 * description: Registers a new email for the CyberWatch newsletter and sends a welcome email.
 * tags:
 * - Subscriptions
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * properties:
 * email:
 * type: string
 * format: email
 * description: The email address to subscribe.
 * responses:
 * 200:
 * description: Successfully subscribed and welcome email sent.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Successfully subscribed and welcome email sent!
 * emailError:
 * type: string
 * description: Present if there was an issue sending the email.
 * 400:
 * description: Invalid email format.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Invalid email format
 * 409:
 * description: Email already subscribed.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Email already subscribed
 * 500:
 * description: Internal Server Error.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Internal Server Error
 */
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const subscribers = JSON.parse(fs.readFileSync(subscribersFile, 'utf-8'));

    if (subscribers.includes(email)) {
      return res.status(409).json({ message: 'Email already subscribed' });
    }

    subscribers.push(email);
    fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2), 'utf-8');

    // Send welcome email
    const emailResult = await emailService.sendWelcomeEmail(email);
    if (emailResult.success) {
      logger.info(`Welcome email successfully sent to ${email}`);
      return res.status(200).json({ message: 'Successfully subscribed and welcome email sent!' });
    } else {
      logger.error(`Failed to send welcome email to ${email}: ${emailResult.error}`);
      // Subscription succeeded, but email sending failed. Notify client.
      return res.status(200).json({ message: 'Successfully subscribed, but failed to send welcome email.', emailError: emailResult.error });
    }
  } catch (err) {
    logger.error('Subscription error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/unsubscribe:
 * post:
 * summary: Unsubscribe from the newsletter
 * description: Removes an email from the CyberWatch newsletter and sends a confirmation email.
 * tags:
 * - Subscriptions
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * properties:
 * email:
 * type: string
 * format: email
 * description: The email address to unsubscribe.
 * responses:
 * 200:
 * description: Successfully unsubscribed and confirmation email sent.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Successfully unsubscribed and confirmation email sent!
 * emailError:
 * type: string
 * description: Present if there was an issue sending the email.
 * 400:
 * description: Invalid email format.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Invalid email format
 * 404:
 * description: Email not found in subscriber list.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Email not found in subscriber list.
 * 500:
 * description: Internal Server Error.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Internal Server Error
 */
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

    // Send unsubscribe confirmation email
    const emailResult = await emailService.sendUnsubscribeConfirmation(email);
    if (emailResult.success) {
      logger.info(`Unsubscribe confirmation email successfully sent to ${email}`);
      return res.status(200).json({ message: 'Successfully unsubscribed and confirmation email sent!' });
    } else {
      logger.error(`Failed to send unsubscribe confirmation email to ${email}: ${emailResult.error}`);
      // Unsubscription succeeded, but email sending failed. Notify client.
      return res.status(200).json({ message: 'Successfully unsubscribed, but failed to send confirmation email.', emailError: emailResult.error });
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
  apis: ['./routes/*.js', './app.js'] // Include app.js to pick up subscriber route comments
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CyberWatch API Docs'
}));

// -----------------------------------------------------------
// HEALTHCHECK & FALLBACKS
// -----------------------------------------------------------
// Healthcheck endpoint
app.get('/health', (req, res) => {
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

// 404 fallback for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

// -----------------------------------------------------------
// ERROR HANDLING
// -----------------------------------------------------------
// Global error handler
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