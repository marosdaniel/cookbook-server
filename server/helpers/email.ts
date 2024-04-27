import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { randomFillSync } from 'crypto';

const getEmailContent = (
  resetToken: string,
) => `<div style="font-family: 'Noto Sans JP', sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background-color: #f9f9f9; padding: 20px;">
  <h2 style="color: #333;">Dear Cookbooker,</h2>
  <p style="color: #333;">You've requested a password reset. Please click on the following link to reset your password:</p>
  <p style="text-align: center;"><a href="${process.env.FE_DOMAIN}/new-password/${resetToken}" style="display: inline-block; padding: 10px 20px; background-color: #088F8F; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
  <p style="color: #333;">If you didn't request a password reset, you can safely ignore this email.</p>
  <p style="color: #333; margin-top: 40px;">Cookbook Support</p>
</div>
</div>
`;

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
  tls: {
    rejectUnauthorized: false,
  },
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD2,
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
    html: getEmailContent(resetToken),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail sent successfully.');
  } catch (error) {
    console.error('An error occurred while sending the email:', error);
  }
};

export { sendPasswordResetEmail, generateResetToken };
