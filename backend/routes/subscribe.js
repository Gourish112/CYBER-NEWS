// subscribe.js
import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// Path to subscribers file
const subscribersFile = path.join(process.cwd(), "subscribers.json");

// Ensure the file exists
if (!fs.existsSync(subscribersFile)) {
  fs.writeFileSync(subscribersFile, "[]", "utf-8");
}

// POST /api/subscribe
router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Invalid email" });
  }

  try {
    const subscribers = JSON.parse(fs.readFileSync(subscribersFile, "utf-8"));

    if (subscribers.includes(email)) {
      return res.status(409).json({ message: "Email already subscribed" });
    }

    subscribers.push(email);
    fs.writeFileSync(
      subscribersFile,
      JSON.stringify(subscribers, null, 2),
      "utf-8"
    );

    // Send confirmation email using Resend API
    try {
      await resend.emails.send({
        from: `CyberWatch <onboarding@resend.dev>`,
        to: email,
        subject: "Subscription Confirmed ✅",
        html: `
          <h2>Welcome to CyberWatch</h2>
          <p>You have successfully subscribed to CyberWatch alerts.</p>
          <p>Expect regular cybersecurity updates right in your inbox!</p>
        `
      });
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
      return res.status(200).json({
        message: "Subscribed, but failed to send email",
        emailError: emailErr.message,
      });
    }

    res.status(200).json({ message: "Successfully subscribed and email sent!" });

  } catch (error) {
    console.error("Error during subscription:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

export default router;
