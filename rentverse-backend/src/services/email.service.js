const nodemailer = require('nodemailer');

/**
 * Email Service for sending OTP and notification emails
 * 
 * Supports multiple SMTP providers:
 * - Gmail (use app password, not regular password)
 * - Outlook/Hotmail
 * - Custom SMTP server
 * - Mailtrap (for testing)
 */

class EmailService {
    constructor() {
        this.transporter = null;
        this.fromAddress = process.env.EMAIL_FROM || 'noreply@rentverse.com';
        this.fromName = process.env.EMAIL_FROM_NAME || 'RentVerse';
        this.isConfigured = false;

        this._initializeTransporter();
    }

    /**
     * Initialize the email transporter based on environment variables
     */
    _initializeTransporter() {
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        // Check if SMTP is configured
        if (!host || !user || !pass) {
            console.log('[EMAIL] SMTP not configured. Emails will be logged to console instead.');
            console.log('[EMAIL] To enable email, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env');
            this.isConfigured = false;
            return;
        }

        try {
            this.transporter = nodemailer.createTransport({
                host: host,
                port: parseInt(port) || 587,
                secure: parseInt(port) === 465, // true for 465, false for other ports
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
        if (!this.isConfigured || !this.transporter) {
            console.log('\n========================================');
            console.log('[EMAIL] Would send email (SMTP not configured):');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content: ${text || this._stripHtml(html)}`);
            console.log('========================================\n');
            return true; // Return true so the flow continues
        }

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
     * Verify SMTP connection
     * @returns {Promise<boolean>}
     */
    async verifyConnection() {
        if (!this.isConfigured || !this.transporter) {
            console.log('[EMAIL] SMTP not configured');
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
