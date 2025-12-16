# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously at Rentverse. If you discover a security vulnerability, please follow this process:

### Do NOT
- ❌ Open a public GitHub issue
- ❌ Post about it on social media
- ❌ Share details publicly before we've had a chance to fix it

### Do
1.  Contact the repository maintainers directly
2. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

### What to Expect
- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Updates**: Every 7 days until resolved
- **Credit**: We'll credit you in our security acknowledgments (unless you prefer anonymity)

## Security Features

RentVerse implements the following security measures:

### Authentication & Authorization
- 🔐 Bcrypt password hashing (12 rounds)
- 🛡️ JWT-based authentication with token expiration
- 📲 Multi-Factor Authentication (MFA) via email OTP
- 🔒 Role-based access control (USER, ADMIN)

### Data Protection
- 🔑 Secure session management with token blacklisting
- 📧 Email verification for account security
- 🔄 Secure password reset with OTP verification
- 🛡️ Account lockout after failed login attempts

### API Security
- ⚡ Rate limiting to prevent abuse
- ✅ Input validation and sanitization
- 🚫 CORS protection
- 📝 Security event logging

### Infrastructure
- 🔒 HTTPS encryption in production
- 🔐 Environment variable protection for secrets
- 📊 Comprehensive security audit logging

## Responsible Disclosure

We believe in responsible disclosure and will:
1. Work with you to understand and validate the issue
2. Keep you informed of our progress
3. Credit researchers who help us improve security
4. Not take legal action against good-faith researchers

Thank you for helping keep RentVerse secure! 🙏
