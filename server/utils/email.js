import nodemailer from 'nodemailer';
import { logger } from './logger.js';

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email service (e.g., SendGrid, AWS SES)
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development - use Ethereal Email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass',
      },
    });
  }
};

const transporter = createTransporter();

// Email templates
const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to LinkedIn Clone!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0077B5;">Welcome to LinkedIn Clone, ${name}!</h1>
        <p>Thank you for joining our professional network. Start building your profile and connecting with professionals in your industry.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/profile" style="background-color: #0077B5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Complete Your Profile</a>
        </div>
        <p>Best regards,<br>The LinkedIn Clone Team</p>
      </div>
    `
  }),
  
  passwordReset: (name, resetToken) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0077B5;">Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/reset-password?token=${resetToken}" style="background-color: #0077B5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The LinkedIn Clone Team</p>
      </div>
    `
  }),
  
  connectionRequest: (senderName, receiverName) => ({
    subject: `${senderName} wants to connect with you`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0077B5;">New Connection Request</h1>
        <p>Hi ${receiverName},</p>
        <p><strong>${senderName}</strong> wants to connect with you on LinkedIn Clone.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/connections" style="background-color: #0077B5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Request</a>
        </div>
        <p>Best regards,<br>The LinkedIn Clone Team</p>
      </div>
    `
  }),
  
  jobApplication: (applicantName, jobTitle, companyName) => ({
    subject: `New application for ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0077B5;">New Job Application</h1>
        <p><strong>${applicantName}</strong> has applied for the position of <strong>${jobTitle}</strong> at ${companyName}.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/jobs/applications" style="background-color: #0077B5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Review Application</a>
        </div>
        <p>Best regards,<br>The LinkedIn Clone Team</p>
      </div>
    `
  })
};

// Send email function
export const sendEmail = async (to, templateName, templateData = {}) => {
  try {
    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const { subject, html } = typeof template === 'function' 
      ? template(...Object.values(templateData))
      : template;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@linkedinclone.com',
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}`, { messageId: result.messageId });
    
    return result;
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};

// Bulk email function
export const sendBulkEmail = async (recipients, templateName, templateData = {}) => {
  try {
    const promises = recipients.map(recipient => 
      sendEmail(recipient, templateName, templateData)
    );
    
    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    logger.info(`Bulk email completed: ${successful} successful, ${failed} failed`);
    
    return { successful, failed, results };
  } catch (error) {
    logger.error('Bulk email sending failed:', error);
    throw error;
  }
};