import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const config = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_EMAIL_USER,
    pass: process.env.SMTP_EMAIL_PASS,
  },
  logger: true,
  debug: true, 
};

export const transporter = nodemailer.createTransport(config);