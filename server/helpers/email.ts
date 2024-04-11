import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { randomFillSync } from 'crypto';

const generateResetToken = (): string => {
  const tokenBuffer = Buffer.alloc(20);
  randomFillSync(tokenBuffer);
  return tokenBuffer.toString('hex');
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  requireTLS: true,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const mailOptions = {
    from: {
      name: 'Cookbook Support',
      address: process.env.EMAIL_USER,
    },
    to: email,
    subject: 'Reset your Cookbook password',
    html: `<p>Dear user,</p><p>Please click on the following link to reset your password:</p><a href="http://yourapp.com/reset-password/${resetToken}">Reset Password</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail sent successfully.');
  } catch (error) {
    console.error('An error occurred while sending the email:', error);
  }
};

export { sendPasswordResetEmail, generateResetToken };
