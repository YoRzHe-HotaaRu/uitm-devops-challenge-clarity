const nodemailer = require('nodemailer');

/**
 * Email Service for sending OTP and notification emails
 * 
 * Supports multiple providers:
 * - Resend (HTTP API - works on Render free tier)
 * - Gmail SMTP (use app password)
 * - Custom SMTP server
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.fromAddress = process.env.EMAIL_FROM || 'noreply@rentverse.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'RentVerse';
    this.isConfigured = false;
    this.useResend = false;
    this.resendApiKey = process.env.RESEND_API_KEY;

    this._initializeTransporter();
  }

  /**
   * Initialize the email transporter based on environment variables
   */
  _initializeTransporter() {
    // Check if Resend is configured (preferred for Render)
    if (this.resendApiKey) {
      console.log('[EMAIL] Resend API configured');
      this.isConfigured = true;
      this.useResend = true;
      return;
    }

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // Check if SMTP is configured
    if (!host || !user || !pass) {
      console.log('[EMAIL] No email provider configured. Emails will be logged to console instead.');
      console.log('[EMAIL] To enable email, set RESEND_API_KEY or SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env');
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: host,
        port: parseInt(port) || 587,
        secure: parseInt(port) === 465 || process.env.SMTP_SECURE === 'true',
        auth: {
          user: user,
          pass: pass,
        },
        // Timeout settings
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      this.isConfigured = true;
      console.log(`[EMAIL] SMTP configured: ${host}:${port}`);
    } catch (error) {
      console.error('[EMAIL] Failed to create transporter:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Send email via Resend API
   */
  async _sendViaResend({ to, subject, html, text }) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${this.fromName} <${this.fromAddress}>`,
          to: [to],
          subject: subject,
          html: html,
          text: text || this._stripHtml(html),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[EMAIL] Resend API error:', error);
        return false;
      }

      const data = await response.json();
      console.log(`[EMAIL] Sent via Resend to ${to}: ${data.id}`);
      return true;
    } catch (error) {
      console.error(`[EMAIL] Resend failed:`, error.message);
      return false;
    }
  }

  /**
   * Send an email (or log to console if not configured)
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content
   * @param {string} options.text - Plain text content (fallback)
   * @returns {Promise<boolean>} - Success status
   */
  async sendEmail({ to, subject, html, text }) {
    const mailOptions = {
      from: `"${this.fromName}" <${this.fromAddress}>`,
      to,
      subject,
      html,
      text: text || this._stripHtml(html),
    };

    // If not configured, log to console
    if (!this.isConfigured) {
      console.log('\n========================================');
      console.log('[EMAIL] Would send email (not configured):');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${text || this._stripHtml(html)}`);
      console.log('========================================\n');
      return true; // Return true so the flow continues
    }

    // Use Resend if configured
    if (this.useResend) {
      return await this._sendViaResend({ to, subject, html, text });
    }

    // Use SMTP
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[EMAIL] Sent to ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`[EMAIL] Failed to send to ${to}:`, error.message);
      return false;
    }
  }

  /**
   * Send OTP verification email
   * @param {string} email - Recipient email
   * @param {string} otp - The OTP code
   * @param {number} expiryMinutes - Minutes until expiry
   * @returns {Promise<boolean>}
   */
  async sendOtpEmail(email, otp, expiryMinutes = 5) {
    const subject = `Your RentVerse Verification Code: ${otp}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                    <div style="display: inline-block; padding: 12px 20px; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); border-radius: 12px;">
                      <span style="color: #ffffff; font-size: 24px; font-weight: bold;">🏠 RentVerse</span>
                    </div>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 32px;">
                    <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #1f2937; text-align: center;">
                      Verification Code
                    </h1>
                    <p style="margin: 0 0 24px; font-size: 16px; color: #6b7280; text-align: center; line-height: 1.5;">
                      Use the code below to complete your login. This code will expire in <strong>${expiryMinutes} minutes</strong>.
                    </p>
                    
                    <!-- OTP Code Box -->
                    <div style="text-align: center; margin: 0 0 24px;">
                      <div style="display: inline-block; padding: 20px 40px; background-color: #f0fdfa; border: 2px dashed #0d9488; border-radius: 12px;">
                        <span style="font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #0d9488;">
                          ${otp}
                        </span>
                      </div>
                    </div>
                    
                    <p style="margin: 0 0 8px; font-size: 14px; color: #9ca3af; text-align: center;">
                      If you didn't request this code, you can safely ignore this email.
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #9ca3af; text-align: center;">
                      Someone may have entered your email by mistake.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                      This is an automated message from RentVerse.<br>
                      Please do not reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const text = `
Your RentVerse Verification Code

Use this code to complete your login: ${otp}

This code will expire in ${expiryMinutes} minutes.

If you didn't request this code, you can safely ignore this email.

- The RentVerse Team
    `.trim();

    return await this.sendEmail({ to: email, subject, html, text });
  }

  /**
   * Send MFA enabled notification email
   * @param {string} email - Recipient email
   * @returns {Promise<boolean>}
   */
  async sendMfaEnabledEmail(email) {
    const subject = 'Two-Factor Authentication Enabled - RentVerse';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>MFA Enabled</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 480px; margin: 0 auto; background: white; padding: 32px; border-radius: 12px;">
          <h1 style="color: #0d9488; margin-bottom: 16px;">🔐 Two-Factor Authentication Enabled</h1>
          <p style="color: #374151; line-height: 1.6;">
            Two-factor authentication has been successfully enabled for your RentVerse account.
          </p>
          <p style="color: #374151; line-height: 1.6;">
            From now on, you'll need to enter a verification code sent to your email each time you log in.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            If you didn't make this change, please contact support immediately.
          </p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send signing reminder email for rental agreement
   * @param {Object} options - Reminder options
   * @param {string} options.to - Recipient email
   * @param {string} options.recipientName - Recipient name
   * @param {string} options.role - 'landlord' or 'tenant'
   * @param {string} options.propertyTitle - Property title
   * @param {string} options.agreementUrl - URL to sign the agreement
   * @returns {Promise<boolean>}
   */
  async sendSigningReminderEmail({ to, recipientName, role, propertyTitle, agreementUrl }) {
    const subject = `⏰ Reminder: Sign Your Rental Agreement - ${propertyTitle}`;

    const roleText = role === 'landlord' ? 'landlord' : 'tenant';
    const actionText = role === 'landlord'
      ? 'As the landlord, your signature is required to proceed with the rental agreement.'
      : 'The landlord has signed the agreement. Your signature is now required to complete the process.';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Signing Reminder</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 520px; margin: 0 auto; background: white; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #f59e0b; margin: 0;">⏰</h1>
            <h2 style="color: #1e293b; margin: 8px 0 0 0;">Signing Reminder</h2>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            Hi <strong>${recipientName}</strong>,
          </p>
          
          <p style="color: #374151; line-height: 1.6;">
            This is a friendly reminder that your signature is pending for the rental agreement:
          </p>
          
          <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #1e293b; font-weight: 600;">🏠 ${propertyTitle}</p>
            <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px;">Role: ${roleText.charAt(0).toUpperCase() + roleText.slice(1)}</p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            ${actionText}
          </p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${agreementUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Sign Agreement Now
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 13px; margin-top: 24px; text-align: center;">
            If you have any questions, please contact our support team.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            This email was sent by RentVerse. Please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({ to, subject, html });
  }

  /**
   * Send booking confirmation email to tenant
   * @param {Object} options
   */
  async sendBookingConfirmationToTenant({ to, tenantName, propertyTitle, landlordName, startDate, endDate, rentAmount, agreementUrl }) {
    const subject = `🎉 Booking Confirmed - ${propertyTitle}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Booking Confirmed</title></head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 520px; margin: 0 auto; background: white; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #10b981; margin: 0;">🎉</h1>
            <h2 style="color: #1e293b; margin: 8px 0 0 0;">Booking Confirmed!</h2>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">Hi <strong>${tenantName}</strong>,</p>
          
          <p style="color: #374151; line-height: 1.6;">
            Great news! Your booking has been confirmed. Here are the details:
          </p>
          
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; color: #1e293b; font-weight: 600;">🏠 ${propertyTitle}</p>
            <p style="margin: 4px 0; color: #64748b; font-size: 14px;">📅 ${startDate} - ${endDate}</p>
            <p style="margin: 4px 0; color: #64748b; font-size: 14px;">👤 Landlord: ${landlordName}</p>
            <p style="margin: 8px 0 0 0; color: #10b981; font-weight: 600; font-size: 18px;">RM ${rentAmount}/month</p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            <strong>Next Step:</strong> Please sign the rental agreement to complete the process.
          </p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${agreementUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              View Agreement
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            This email was sent by RentVerse. Please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({ to, subject, html });
  }

  /**
   * Send new booking notification to landlord
   * @param {Object} options
   */
  async sendBookingNotificationToLandlord({ to, landlordName, tenantName, tenantEmail, propertyTitle, startDate, endDate, rentAmount, agreementUrl }) {
    const subject = `📋 New Booking Request - ${propertyTitle}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>New Booking</title></head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 520px; margin: 0 auto; background: white; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #6366f1; margin: 0;">📋</h1>
            <h2 style="color: #1e293b; margin: 8px 0 0 0;">New Booking Request</h2>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">Hi <strong>${landlordName}</strong>,</p>
          
          <p style="color: #374151; line-height: 1.6;">
            You have a new booking for your property:
          </p>
          
          <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; color: #1e293b; font-weight: 600;">🏠 ${propertyTitle}</p>
            <p style="margin: 4px 0; color: #64748b; font-size: 14px;">📅 ${startDate} - ${endDate}</p>
            <p style="margin: 4px 0; color: #64748b; font-size: 14px;">👤 Tenant: ${tenantName} (${tenantEmail})</p>
            <p style="margin: 8px 0 0 0; color: #6366f1; font-weight: 600; font-size: 18px;">RM ${rentAmount}/month</p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            <strong>Action Required:</strong> Please sign the rental agreement to proceed.
          </p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${agreementUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Review & Sign Agreement
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            This email was sent by RentVerse. Please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({ to, subject, html });
  }

  /**
   * Send agreement completed email to both parties
   * @param {Object} options
   */
  async sendAgreementCompletedEmail({ to, recipientName, role, propertyTitle, otherPartyName, startDate, endDate, pdfUrl, dashboardUrl }) {
    const subject = `✅ Rental Agreement Completed - ${propertyTitle}`;
    const roleText = role === 'landlord' ? 'tenant' : 'landlord';

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Agreement Completed</title></head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 520px; margin: 0 auto; background: white; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #10b981; margin: 0;">✅</h1>
            <h2 style="color: #1e293b; margin: 8px 0 0 0;">Agreement Completed!</h2>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">Hi <strong>${recipientName}</strong>,</p>
          
          <p style="color: #374151; line-height: 1.6;">
            Great news! The rental agreement has been signed by both parties and is now complete.
          </p>
          
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; color: #1e293b; font-weight: 600;">🏠 ${propertyTitle}</p>
            <p style="margin: 4px 0; color: #64748b; font-size: 14px;">📅 ${startDate} - ${endDate}</p>
            <p style="margin: 4px 0; color: #64748b; font-size: 14px;">👤 ${roleText.charAt(0).toUpperCase() + roleText.slice(1)}: ${otherPartyName}</p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            You can download the signed agreement from your dashboard.
          </p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${dashboardUrl}" style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              View Agreement
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            This email was sent by RentVerse. Please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({ to, subject, html });
  }

  /**
   * Send OAuth login notification email
   * @param {string} email - Recipient email
   * @param {string} provider - OAuth provider (google, facebook, etc.)
   * @param {string} userName - User's name
   * @param {Object} loginInfo - Login information
   * @returns {Promise<boolean>}
   */
  async sendOAuthLoginNotification(email, provider, userName, loginInfo = {}) {
    const subject = `New ${provider.charAt(0).toUpperCase() + provider.slice(1)} Sign In to RentVerse`;

    const loginTime = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏠 RentVerse</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e293b; margin-top: 0;">New Sign In Detected</h2>
          
          <p style="color: #475569;">Hi${userName ? ' ' + userName : ''},</p>
          
          <p style="color: #475569;">We noticed a new sign in to your RentVerse account using <strong>${provider.charAt(0).toUpperCase() + provider.slice(1)}</strong>.</p>
          
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Sign In Method:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${provider.charAt(0).toUpperCase() + provider.slice(1)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Time:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${loginTime}</td>
              </tr>
              ${loginInfo.device ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Device:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${loginInfo.device}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <p style="color: #475569;">If this was you, you can safely ignore this email.</p>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>⚠️ Wasn't you?</strong><br>
              If you didn't sign in, please secure your account immediately by changing your password and reviewing your linked accounts.
            </p>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            The RentVerse Team
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
          <p>© ${new Date().getFullYear()} RentVerse. All rights reserved.</p>
          <p>This is an automated security notification.</p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Strip HTML tags for plain text fallback
   * @param {string} html - HTML content
   * @returns {string} Plain text
   */
  _stripHtml(html) {
    return html
      .replace(/<style[^>]*>.*<\/style>/gm, '')
      .replace(/<script[^>]*>.*<\/script>/gm, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Verify connection (for SMTP only)
   * @returns {Promise<boolean>}
   */
  async verifyConnection() {
    if (this.useResend) {
      console.log('[EMAIL] Resend API configured - no connection verification needed');
      return true;
    }

    if (!this.isConfigured || !this.transporter) {
      console.log('[EMAIL] Email not configured');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('[EMAIL] SMTP connection verified');
      return true;
    } catch (error) {
      console.error('[EMAIL] SMTP verification failed:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();
