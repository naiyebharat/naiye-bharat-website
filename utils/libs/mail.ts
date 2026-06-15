// @ts-nocheck

import nodemailer from "nodemailer";
import {
  sendClientOrderConfirmTemplate,
  sendEmailOtpTemplate,
  sendExpertNewOrderTemplate,
  sendWelcomeEmailTemplate,
} from "./emailTemplate";

// Nodemailer Transporter Matrix setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * 1. Send OTP Verification Email
 */
export async function sendOtpEmail(toEmail, otp) {
  try {
    const htmlContent = sendEmailOtpTemplate(otp);

    const mailOptions = {
      from: `"Naiye Bharat Secure" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: "🔒 Your Naiye Bharat Verification Code",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP Email dispatched successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Nodemailer OTP Pipeline Error:", error);
    throw new Error("Failed to dispatch verification OTP payload.");
  }
}

/**
 * 2. Send Welcome Onboarding Email
 */
export async function sendWelcomeEmail(toEmail, firstName) {
  try {
    const htmlContent = sendWelcomeEmailTemplate(firstName);

    const mailOptions = {
      from: `"Naiye Bharat Support" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: "🏛️ Welcome to Naiye Bharat - Account Activated Successfully",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Welcome Email dispatched successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Nodemailer Welcome Pipeline Error:", error);
    throw new Error("Failed to dispatch onboarding welcome mail.");
  }
}

/**
 * 3. Send Client Order Confirmation Email
 */
export async function sendClientOrderConfirmationEmail(toEmail, orderDetails) {
  try {
    const htmlContent = sendClientOrderConfirmTemplate(orderDetails);

    const mailOptions = {
      from: `"Naiye Bharat Consultations" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Your Naiye Bharat consultation is confirmed - ${orderDetails.orderId}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Client order confirmation email dispatched:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Nodemailer client order confirmation error:", error);
    throw new Error("Failed to dispatch client order confirmation mail.");
  }
}

/**
 * 4. Send Expert New Order Notification Email
 */
export async function sendExpertNewOrderEmail(toEmail, orderDetails) {
  try {
    const htmlContent = sendExpertNewOrderTemplate(orderDetails);

    const mailOptions = {
      from: `"Naiye Bharat Orders" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `New paid consultation assigned - ${orderDetails.orderId}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Expert new order email dispatched:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Nodemailer expert new order error:", error);
    throw new Error("Failed to dispatch expert new order mail.");
  }
}
