// subscribe.js
import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import emailService from "../utils/emailService.js";

dotenv.config();

const router = express.Router();

// Path to subscribers file
const subscribersFile = path.join(process.cwd(), "subscribers.json");

// Ensure the file exists
if (!fs.existsSync(subscribersFile)) {
  fs.writeFileSync(subscribersFile, "[]", "utf-8");
}

// POST /api/subscribe
router.post("/", async (req, res) => {
  const { email } = req.body;

  console.log("📩 Incoming subscription request:", email);

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Invalid email" });
  }

  try {
    const subscribers = JSON.parse(fs.readFileSync(subscribersFile, "utf-8"));

    if (subscribers.includes(email)) {
      return res.status(409).json({ message: "Email already subscribed" });
    }

    // Save subscriber
    subscribers.push(email);
    fs.writeFileSync(
      subscribersFile,
      JSON.stringify(subscribers, null, 2),
      "utf-8"
    );

    // Send welcome email using SendGrid
    console.log("📨 Sending welcome email using SendGrid...");

    const result = await emailService.sendWelcomeEmail(email);

    if (!result.success) {
      console.error("❌ SendGrid email error:", result.error);

      return res.status(200).json({
        message: "Subscribed, but failed to send email",
        emailError: result.error,
      });
    }

    res.status(200).json({
      message: "Successfully subscribed and welcome email sent!",
    });

  } catch (error) {
    console.error("❌ Subscription error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

export default router;
