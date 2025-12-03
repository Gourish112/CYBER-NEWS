// utils/emailService.js
import nodemailer from "nodemailer";
import logger from "./logger.js";
import dotenv from "dotenv";
dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,           // your gmail
        pass: process.env.EMAIL_PASSWORD,   // your Gmail App Password
      },
    });
  }

  async sendWelcomeEmail(to) {
    try {
      logger.info(`📨 Sending welcome email to: ${to}`);

      const result = await this.transporter.sendMail({
        from: `"CyberWatch" <${process.env.EMAIL_USER}>`,
        to,
        subject: "🔐 Welcome to CyberWatch Newsletter!",
        html: `
          <h2>Welcome to CyberWatch!</h2>
          <p>Hi ${to},</p>
          <p>You've successfully subscribed to the CyberWatch Newsletter.</p>
        `,
      });

      logger.info("📩 Nodemailer response:", result);

      return { success: true, messageId: result.messageId };
    } catch (err) {
      logger.error("❌ Failed to send welcome email:", err);
      return { success: false, error: err.message };
    }
  }

  async sendUnsubscribeConfirmation(to) {
    try {
      logger.info(`📨 Sending unsubscribe email to: ${to}`);

      const result = await this.transporter.sendMail({
        from: `"CyberWatch" <${process.env.EMAIL_USER}>`,
        to,
        subject: "You have unsubscribed from CyberWatch",
        html: `
          <h2>Unsubscribed from CyberWatch</h2>
          <p>Your email ${to} has been removed from our subscriber list.</p>
        `,
      });

      logger.info("📩 Nodemailer response:", result);

      return { success: true, messageId: result.messageId };
    } catch (err) {
      logger.error("❌ Failed to send unsubscribe email:", err);
      return { success: false, error: err.message };
    }
  }
}

export default new EmailService();
