"use strict";

const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!env.SMTP_HOST || !env.SMTP_USER) {
    // Dev fallback: log emails to console instead of sending
    transporter = {
      sendMail: async (opts) => {
        console.log("\n===== [DEV MAIL — not sent] =====");
        console.log("To:      ", opts.to);
        console.log("Subject: ", opts.subject);
        console.log("Text:    ", opts.text);
        console.log("=================================\n");
        return { messageId: "dev-" + Date.now() };
      },
      isDevMock: true,
    };
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  });
  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  const t = getTransporter();
  const from = `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`;
  return t.sendMail({ from, to, subject, text, html });
}

async function sendPasswordResetEmail({ to, fullName, resetUrl }) {
  const subject = "Diamond Body — Reset your password";
  const text =
`Hi ${fullName || "there"},

We received a request to reset your Diamond Body password.

Click the link below to set a new password. This link expires in 1 hour.

${resetUrl}

If you didn't request this, you can safely ignore this email.

— Diamond Body Team`;
  const html = `
<!doctype html><html><body style="font-family: Arial, sans-serif; background:#F5F5F5; padding:24px;">
  <div style="max-width:520px; margin:0 auto; background:white; border-radius:16px; padding:32px; border:1px solid #eee;">
    <h1 style="color:#4A0E16; font-family:Georgia,serif; margin:0 0 12px;">Reset your password</h1>
    <p>Hi ${fullName || "there"},</p>
    <p>We received a request to reset your Diamond Body password. Click the button below to choose a new one.</p>
    <p style="text-align:center; margin:32px 0;">
      <a href="${resetUrl}"
         style="display:inline-block; background:#4A0E16; color:white; padding:14px 28px; border-radius:999px; text-decoration:none; font-weight:600;">
         Reset Password
      </a>
    </p>
    <p style="color:#666; font-size:12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    <hr style="border:none; border-top:1px solid #eee; margin:24px 0;"/>
    <p style="color:#999; font-size:11px; text-align:center;">Diamond Body Wellness Ltd</p>
  </div>
</body></html>`;
  return sendEmail({ to, subject, text, html });
}

module.exports = { sendEmail, sendPasswordResetEmail };
