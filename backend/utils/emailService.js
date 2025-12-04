// utils/emailService.js
import sgMail from "@sendgrid/mail";
import logger from "./logger.js";
import dotenv from "dotenv";
dotenv.config();

// Load SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  async sendWelcomeEmail(to) {
    try {
      logger.info(`📨 Sending welcome email to: ${to}`);

      const msg = {
        to,
        from: {
          name: "CyberWatch",
          email: process.env.EMAIL_FROM, // verified sender
        },
        subject: "🔐 Welcome to CyberWatch Newsletter!",
        html: `
          <h2>Welcome to CyberWatch!</h2>
          <p>Hi ${to},</p>
          <p>You've successfully subscribed to the CyberWatch Newsletter.</p>
        `,
      };

      const result = await sgMail.send(msg);

      logger.info("📩 SendGrid email response:", result);

      return { success: true };
    } catch (err) {
      logger.error("❌ SendGrid email error:", err);

      return {
        success: false,
        error: err.response?.body?.errors?.[0]?.message || err.message,
      };
    }
  }

  async sendUnsubscribeConfirmation(to) {
    try {
      logger.info(`📨 Sending unsubscribe email to: ${to}`);

      const msg = {
        to,
        from: {
          name: "CyberWatch",
          email: process.env.EMAIL_FROM,
        },
        subject: "You've unsubscribed from CyberWatch",
        html: `
          <h2>Unsubscribed from CyberWatch</h2>
          <p>Your email ${to} has been removed from our subscriber list.</p>
        `,
      };

      const result = await sgMail.send(msg);

      logger.info("📩 SendGrid email response:", result);

      return { success: true };
    } catch (err) {
      logger.error("❌ SendGrid unsubscribe email error:", err);

      return {
        success: false,
        error: err.response?.body?.errors?.[0]?.message || err.message,
      };
    }
  }
}

export default new EmailService();
