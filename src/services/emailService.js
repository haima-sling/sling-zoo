const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection configuration
      await this.transporter.verify();
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  async sendEmail(options) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      const mailOptions = {
        from: {
          name: 'Zoo Management System',
          address: process.env.EMAIL_USER
        },
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments || []
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}`, { messageId: result.messageId });
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Zoo Management System</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c5530; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #2c5530; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Zoo Management System</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.firstName}!</h2>
            <p>Welcome to our zoo management system. We're excited to have you on board!</p>
            <p>Your account has been created successfully with the following details:</p>
            <ul>
              <li><strong>Name:</strong> ${user.firstName} ${user.lastName}</li>
              <li><strong>Email:</strong> ${user.email}</li>
              <li><strong>Role:</strong> ${user.role}</li>
            </ul>
            <p>You can now log in to the system and start managing zoo operations.</p>
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/login" class="button">Login to System</a>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Zoo Management System.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Welcome to Zoo Management System',
      html: html,
      text: `Welcome ${user.firstName}! Your account has been created successfully. You can now log in to the system.`
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #d32f2f; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 5px; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.firstName}!</h2>
            <p>We received a request to reset your password for your Zoo Management System account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <div class="warning">
              <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
              <p>If you didn't request this password reset, please ignore this email.</p>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Zoo Management System.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Zoo Management System',
      html: html,
      text: `Hello ${user.firstName}! Click this link to reset your password: ${resetUrl}`
    });
  }

  async sendTicketConfirmationEmail(visitor, ticket) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ticket Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c5530; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .ticket-info { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .qr-code { text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ticket Confirmation</h1>
          </div>
          <div class="content">
            <h2>Hello ${visitor.firstName}!</h2>
            <p>Thank you for purchasing a ticket to our zoo. Here are your ticket details:</p>
            
            <div class="ticket-info">
              <h3>Ticket Information</h3>
              <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
              <p><strong>Type:</strong> ${ticket.type}</p>
              <p><strong>Visit Date:</strong> ${new Date(ticket.visitDate).toLocaleDateString()}</p>
              <p><strong>Price:</strong> $${ticket.price}</p>
              <p><strong>Purchase Date:</strong> ${new Date(ticket.purchaseDate).toLocaleDateString()}</p>
            </div>
            
            <div class="qr-code">
              <p>Please present this QR code at the entrance:</p>
              <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; display: inline-block;">
                <p style="font-family: monospace; font-size: 18px;">${ticket.ticketId}</p>
              </div>
            </div>
            
            <p>We look forward to seeing you at the zoo!</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Zoo Management System.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: visitor.email,
      subject: 'Ticket Confirmation - Zoo Visit',
      html: html,
      text: `Hello ${visitor.firstName}! Your ticket (${ticket.ticketId}) has been confirmed for ${new Date(ticket.visitDate).toLocaleDateString()}.`
    });
  }

  async sendMaintenanceAlertEmail(staff, maintenance) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Maintenance Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .alert { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Maintenance Alert</h1>
          </div>
          <div class="content">
            <h2>Hello ${staff.firstName}!</h2>
            <div class="alert">
              <p><strong>Maintenance Required:</strong> ${maintenance.description}</p>
              <p><strong>Exhibit:</strong> ${maintenance.exhibitName}</p>
              <p><strong>Priority:</strong> ${maintenance.priority}</p>
              <p><strong>Scheduled Date:</strong> ${new Date(maintenance.scheduledDate).toLocaleDateString()}</p>
            </div>
            <p>Please review the maintenance request and take appropriate action.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Zoo Management System.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: staff.email,
      subject: 'Maintenance Alert - Zoo Management System',
      html: html,
      text: `Maintenance Alert: ${maintenance.description} at ${maintenance.exhibitName}`
    });
  }

  async sendHealthCheckReminderEmail(staff, animal) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Health Check Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196f3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .reminder { background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Health Check Reminder</h1>
          </div>
          <div class="content">
            <h2>Hello ${staff.firstName}!</h2>
            <div class="reminder">
              <p><strong>Animal:</strong> ${animal.name} (${animal.species})</p>
              <p><strong>Exhibit:</strong> ${animal.exhibitName}</p>
              <p><strong>Last Health Check:</strong> ${animal.lastHealthCheck ? new Date(animal.lastHealthCheck).toLocaleDateString() : 'Never'}</p>
              <p><strong>Next Health Check Due:</strong> ${animal.nextHealthCheck ? new Date(animal.nextHealthCheck).toLocaleDateString() : 'ASAP'}</p>
            </div>
            <p>Please schedule a health check for this animal as soon as possible.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Zoo Management System.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: staff.email,
      subject: 'Health Check Reminder - Zoo Management System',
      html: html,
      text: `Health Check Reminder: ${animal.name} (${animal.species}) is due for a health check.`
    });
  }

  async sendBulkEmail(recipients, subject, html, text) {
    try {
      const results = [];
      
      for (const recipient of recipients) {
        try {
          const result = await this.sendEmail({
            to: recipient.email,
            subject: subject,
            html: html,
            text: text
          });
          results.push({ recipient: recipient.email, success: true, result });
        } catch (error) {
          results.push({ recipient: recipient.email, success: false, error: error.message });
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Failed to send bulk email:', error);
      throw error;
    }
  }

  async sendNewsletterEmail(subscribers, newsletter) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${newsletter.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c5530; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .unsubscribe { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${newsletter.title}</h1>
          </div>
          <div class="content">
            ${newsletter.content}
          </div>
          <div class="footer">
            <p>This is a newsletter from the Zoo Management System.</p>
            <div class="unsubscribe">
              <p>If you no longer wish to receive these emails, you can <a href="${process.env.FRONTEND_URL}/unsubscribe">unsubscribe here</a>.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendBulkEmail(subscribers, newsletter.title, html, newsletter.textContent);
  }
}

module.exports = new EmailService();
