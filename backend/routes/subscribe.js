// subscribe.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { google } from 'googleapis'; // Import googleapis

dotenv.config();

const router = express.Router();
const subscribersFile = path.join(process.cwd(), 'subscribers.json');

// Ensure the file exists
if (!fs.existsSync(subscribersFile)) {
  fs.writeFileSync(subscribersFile, '[]', 'utf-8');
}

// OAuth2 setup
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.OAUTH_CLIENT_ID,     // Your Client ID
  process.env.OAUTH_CLIENT_SECRET, // Your Client Secret
  'https://developers.google.com/oauthplayground' // Redirect URL
);

oauth2Client.setCredentials({
  refresh_token: process.env.OAUTH_REFRESH_TOKEN, // Your Refresh Token
});

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER, // Your Gmail email address (e.g., api@cyberwatch.com)
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    accessToken: oauth2Client.getAccessToken(), // Automatically gets an access token using the refresh token
  },
});

// POST /api/subscribe
router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email' });
  }

  try {
    const subscribers = JSON.parse(fs.readFileSync(subscribersFile, 'utf-8'));

    if (subscribers.includes(email)) {
      return res.status(409).json({ message: 'Email already subscribed' });
    }

    subscribers.push(email);
    // Write the updated subscribers list back to the file
    fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));

    // Send confirmation email
    await transporter.sendMail({
      from: `"CyberWatch" <${process.env.EMAIL_USER}>`, // Sender address
      to: email, // List of receivers
      subject: 'Subscription Confirmed ✅', // Subject line
      html: `<h2>Welcome to CyberWatch</h2><p>You have successfully subscribed to alerts.</p><p>Stay tuned for the latest cybersecurity news!</p>` // HTML body
    });

    res.status(200).json({ message: 'Successfully subscribed and email sent!' });
  } catch (error) {
    console.error('Error during subscription:', error); // Log the error
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

export default router;