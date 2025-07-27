const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    this.useNodemailer = process.env.EMAIL_HOST && process.env.EMAIL_USER;
    this.useSendGrid = process.env.SENDGRID_API_KEY;
    this.emailEnabled = process.env.EMAIL_ENABLED === 'true';

    if (this.emailEnabled) {
      if (this.useSendGrid) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        console.log('Email service initialized with SendGrid');
      } else if (this.useNodemailer) {
        this.transporter = nodemailer.createTransporter({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT),
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        console.log('Email service initialized with Nodemailer');
      } else {
        console.warn('Email service: No valid email configuration found');
      }
    } else {
      console.log('Email service disabled');
    }
  }

  async sendEmail({ to, subject, html, text }) {
    if (!this.emailEnabled) {
      console.log('Email service disabled - skipping email:', { to, subject });
      return { success: false, message: 'Email service disabled' };
    }

    try {
      if (this.useSendGrid) {
        const msg = {
          to,
          from: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM,
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, ''), // Strip HTML for text
        };
        await sgMail.send(msg);
        console.log('Email sent via SendGrid to:', to);
        return { success: true, provider: 'sendgrid' };
      } else if (this.useNodemailer && this.transporter) {
        const info = await this.transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, ''),
        });
        console.log('Email sent via Nodemailer to:', to, 'MessageId:', info.messageId);
        return { success: true, provider: 'nodemailer', messageId: info.messageId };
      } else {
        throw new Error('No email provider configured');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendLowStockAlert(user, products) {
    const productList = products.map(p => 
      `<li><strong>${p.name}</strong> (SKU: ${p.sku}) - Current Stock: ${p.currentStock}, Threshold: ${p.minThreshold}</li>`
    ).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🚨 Low Stock Alert</h2>
        <p>Dear ${user.name},</p>
        <p>The following products are running low on stock:</p>
        <ul style="color: #374151;">
          ${productList}
        </ul>
        <p>Please consider restocking these items to avoid stockouts.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated message from your Inventory Management System.
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: `Low Stock Alert - ${products.length} item(s) need attention`,
      html,
    });
  }

  async sendStockoutAlert(user, products) {
    const productList = products.map(p => 
      `<li><strong>${p.name}</strong> (SKU: ${p.sku}) - OUT OF STOCK</li>`
    ).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🔴 URGENT: Stock Out Alert</h2>
        <p>Dear ${user.name},</p>
        <p>The following products are completely out of stock:</p>
        <ul style="color: #dc2626; font-weight: bold;">
          ${productList}
        </ul>
        <p><strong>Immediate action required!</strong> These items need to be restocked urgently.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated message from your Inventory Management System.
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: `URGENT: Stock Out Alert - ${products.length} item(s) out of stock`,
      html,
    });
  }

  async sendWelcomeEmail(user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Welcome to Inventory Management System!</h2>
        <p>Dear ${user.name},</p>
        <p>Your account has been successfully created. You can now access the inventory management system.</p>
        <p><strong>Account Details:</strong></p>
        <ul>
          <li>Email: ${user.email}</li>
          <li>Role: ${user.role}</li>
        </ul>
        <p>Please keep your login credentials secure and contact your administrator if you need any assistance.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated message from your Inventory Management System.
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Welcome to Inventory Management System',
      html,
    });
  }
}

module.exports = new EmailService();