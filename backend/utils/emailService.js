// utils/emailService.js
import nodemailer from 'nodemailer';
import { config } from '../config/config.js';
import logger from './logger.js';
import dotenv from 'dotenv';
dotenv.config();
class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    

    if (config.email.provider === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.email.user,
          pass: config.email.password, // Use App Password for Gmail
        },
      });
    }
    
    // Option 2: Outlook/Hotmail
    else if (config.email.provider === 'outlook') {
      this.transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });
    }
    
    // Option 3: Custom SMTP
    else if (config.email.provider === 'smtp') {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure, // true for 465, false for other ports
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });
    }
    
    // Option 4: SendGrid
    else if (config.email.provider === 'sendgrid') {
      this.transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: config.email.apiKey,
        },
      });
    }
    
    // Option 5: Mailgun
    else if (config.email.provider === 'mailgun') {
      this.transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: config.email.user,
          pass: config.email.apiKey,
        },
      });
    }
    
    else {
      logger.error('Invalid email provider configuration');
      throw new Error('Email provider not configured properly');
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('Email service connected successfully');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email) {
    const mailOptions = {
      from: {
        name: 'CyberWatch Team',
        address: config.email.from
      },
      to: email,
      subject: '🔐 Welcome to CyberWatch Newsletter!',
      html: this.getWelcomeEmailTemplate(email),
      text: this.getWelcomeEmailText(email)
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${email}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error(`Failed to send welcome email to ${email}:`, error);
      return { success: false, error: error.message };
    }
  }

  async sendUnsubscribeConfirmation(email) {
    const mailOptions = {
      from: {
        name: 'CyberWatch Team',
        address: config.email.from
      },
      to: email,
      subject: 'Unsubscribed from CyberWatch Newsletter',
      html: this.getUnsubscribeEmailTemplate(email),
      text: this.getUnsubscribeEmailText(email)
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Unsubscribe confirmation sent to ${email}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error(`Failed to send unsubscribe confirmation to ${email}:`, error);
      return { success: false, error: error.message };
    }
  }

  async sendNewsletterToSubscribers(subscribers, newsletterContent) {
    const results = [];
    
    for (const email of subscribers) {
      const mailOptions = {
        from: {
          name: 'CyberWatch',
          address: config.email.from
        },
        to: email,
        subject: newsletterContent.subject,
        html: newsletterContent.html,
        text: newsletterContent.text
      };

      try {
        const result = await this.transporter.sendMail(mailOptions);
        results.push({ email, success: true, messageId: result.messageId });
        logger.info(`Newsletter sent to ${email}`);
      } catch (error) {
        results.push({ email, success: false, error: error.message });
        logger.error(`Failed to send newsletter to ${email}:`, error);
      }
    }

    return results;
  }

  getWelcomeEmailTemplate(email) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to CyberWatch</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f8f9fa; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .button { background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Welcome to CyberWatch!</h1>
            </div>
            <div class="content">
                <h2>Thank you for subscribing!</h2>
                <p>Hi there,</p>
                <p>Welcome to CyberWatch Newsletter! You've successfully subscribed with <strong>${email}</strong>.</p>
                <p>You'll now receive the latest cybersecurity news, threats, and insights directly in your inbox.</p>
                
                <h3>What to expect:</h3>
                <ul>
                    <li>🚨 Latest cybersecurity threats and vulnerabilities</li>
                    <li>📊 Industry analysis and trends</li>
                    <li>🛡️ Security best practices and tips</li>
                    <li>📰 Curated news from trusted sources</li>
                </ul>
                
                <p>Stay secure and informed!</p>
                
                <p>Best regards,<br>The CyberWatch Team</p>
            </div>
            <div class="footer">
                <p>You received this email because you subscribed to CyberWatch Newsletter.</p>
                <p>If you no longer wish to receive these emails, you can <a href="${config.frontend.url}/unsubscribe?email=${encodeURIComponent(email)}">unsubscribe here</a>.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  getWelcomeEmailText(email) {
    return `
    Welcome to CyberWatch Newsletter!

    Thank you for subscribing with ${email}.

    You'll now receive the latest cybersecurity news, threats, and insights directly in your inbox.

    What to expect:
    - Latest cybersecurity threats and vulnerabilities
    - Industry analysis and trends
    - Security best practices and tips
    - Curated news from trusted sources

    Stay secure and informed!

    Best regards,
    The CyberWatch Team

    To unsubscribe, visit: ${config.frontend.url}/unsubscribe?email=${encodeURIComponent(email)}
    `;
  }

  getUnsubscribeEmailTemplate(email) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed from CyberWatch</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f8f9fa; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Unsubscribed from CyberWatch</h1>
            </div>
            <div class="content">
                <h2>We're sorry to see you go!</h2>
                <p>Hi there,</p>
                <p>You have successfully unsubscribed from CyberWatch Newsletter.</p>
                <p>Your email <strong>${email}</strong> has been removed from our mailing list.</p>
                <p>If you change your mind, you can always subscribe again at our website.</p>
                
                <p>Stay safe online!</p>
                
                <p>Best regards,<br>The CyberWatch Team</p>
            </div>
            <div class="footer">
                <p>This is a confirmation of your unsubscription from CyberWatch Newsletter.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  getUnsubscribeEmailText(email) {
    return `
    Unsubscribed from CyberWatch Newsletter

    You have successfully unsubscribed from CyberWatch Newsletter.
    Your email ${email} has been removed from our mailing list.

    If you change your mind, you can always subscribe again at our website.

    Stay safe online!

    Best regards,
    The CyberWatch Team
    `;
  }
}

export default new EmailService();
