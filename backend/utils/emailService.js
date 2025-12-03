// utils/emailService.js
import { Resend } from "resend";
import logger from "./logger.js";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {
  async sendWelcomeEmail(to) {
    try {
      logger.info(`📨 Sending welcome email to: ${to}`);

      const result = await resend.emails.send({
        from: "CyberWatch <onboarding@resend.dev>", // replace with your verified resend.dev email
        to,
        subject: "🔐 Welcome to CyberWatch Newsletter!",
        html: `
          <h2>Welcome to CyberWatch!</h2>
          <p>Hi ${to},</p>
          <p>You've successfully subscribed to CyberWatch Newsletter. Stay tuned for the latest cybersecurity updates!</p>
        `,
      });

      logger.info("📩 Resend response:", result);

      if (result.error) {
        logger.error("❌ Resend API returned error:", result.error);
        return { success: false, error: result.error.message };
      }

      return { success: true };
    } catch (err) {
      logger.error("❌ Failed to send welcome email:", err);
      return { success: false, error: err.message };
    }
  }

  async sendUnsubscribeConfirmation(to) {
    try {
      logger.info(`📨 Sending unsubscribe email to: ${to}`);

      const result = await resend.emails.send({
        from: "CyberWatch <onboarding@resend.dev>", // replace with your verified resend.dev email
        to,
        subject: "You have unsubscribed from CyberWatch",
        html: `
          <h2>Unsubscribed from CyberWatch</h2>
          <p>Your email ${to} has been removed from our subscriber list.</p>
          <p>If you change your mind, you can subscribe again anytime.</p>
        `,
      });

      logger.info("📩 Resend response:", result);

      if (result.error) {
        logger.error("❌ Resend API returned error:", result.error);
        return { success: false, error: result.error.message };
      }

      return { success: true };
    } catch (err) {
      logger.error("❌ Failed to send unsubscribe email:", err);
      return { success: false, error: err.message };
    }
  }
}

export default new EmailService();
