# ✨ Special Features

Beyond the core security modules, RentVerse includes these unique features that enhance the rental experience.

---

## 📝 Digital Rental Agreements

Complete digital agreement workflow with legally-binding electronic signatures.

**Features:**
| Feature | Description |
|---------|-------------|
| 🔏 **E-Signatures** | Canvas-based signature capture with SHA-256 hashing |
| 📄 **PDF Generation** | Automated lease contract generation with Puppeteer |
| ✅ **Dual-Party Signing** | Landlord signs first, then tenant counter-signs |
| 📊 **Audit Trail** | Complete history of all agreement actions |
| 🔐 **Document Integrity** | Hash verification ensures no tampering |
| ☁️ **Cloud Storage** | PDFs stored securely on Cloudinary |

**Signing Workflow:**
```
1. Landlord creates lease → PDF generated
2. Landlord signs → Signature hash stored
3. Tenant notified → Signs agreement
4. Both signatures → Agreement activated
5. Both parties receive final PDF
```

**Key Files:**
- `digitalAgreement.service.js` - Workflow & signature validation
- `pdfGeneration.service.js` - Puppeteer PDF generation
- `eSignature.service.js` - Canvas signature handling
- `agreement.routes.js` - Agreement API endpoints

---

## 🔐 OTP-Based Password Reset

Secure forgot password flow with email OTP verification.

**Security Features:**
- ✅ Rate-limited requests (3/minute)
- ✅ OTP expires in 5 minutes
- ✅ Reset token expires in 5 minutes
- ✅ Password strength requirements enforced
- ✅ Confirmation email on password change
- ✅ Generic responses prevent email enumeration

**Flow:**
```
1. User enters email → OTP sent
2. User enters OTP → Verified
3. User sets new password → Updated
4. Confirmation email sent
```

**Key Files:**
- `auth.js` - `/forgot-password/*` endpoints
- `email.service.js` - Password reset email templates
- `app/auth/forgot-password/page.tsx` - Frontend UI

---

## 📧 Smart Email Notification System

Beautiful, responsive email templates for all platform events.

**Email Types:**
| Email | Trigger |
|-------|---------|
| 🔐 **Login OTP** | MFA verification during login |
| 🔑 **Password Reset OTP** | Forgot password request |
| ✅ **Password Changed** | After password update |
| 🛡️ **MFA Enabled** | When user enables 2FA |
| ⚠️ **Security Alert** | Suspicious activity detected |
| 📝 **Agreement Ready** | When lease is ready to sign |
| ✅ **Agreement Signed** | Confirmation of signatures |

**Features:**
- 📱 Mobile-responsive HTML templates
- 🎨 Branded with RentVerse colors
- 📧 Works with Gmail, Outlook, Apple Mail
- 🔄 Fallback plain text for all emails

---

## 👑 Admin Dashboard

Comprehensive administration panel for platform management.

**Admin Features:**
| Module | Capabilities |
|--------|--------------|
| 👥 **User Management** | View, suspend, delete users |
| 🏠 **Property Moderation** | Approve, reject, feature listings |
| 📝 **Agreement Oversight** | View all agreements, download PDFs |
| 🔒 **Security Logs** | View login attempts, security events |

**Access Control:**
- Only users with `role: ADMIN` can access
- Protected API routes with role middleware
- Audit logging for all admin actions

**Key Files:**
- `admin.users.routes.js` - User management
- `admin.properties.routes.js` - Property moderation
- `admin.agreements.routes.js` - Agreement oversight
- `admin.security.routes.js` - Security logs
- `app/admin/*` - Admin frontend pages

---

## 📱 Mobile Application

Native Android app built with Capacitor for on-the-go access.

**Features:**
- 🔗 Deep linking to properties
- 🔔 Push notification ready
- 📷 Property photo viewing
- 🔐 Full authentication support
- 📝 View and manage agreements

**Download:**
- [RentVerse APK](MobileAppBuild/rentverse-clarity.apk)

**Key Files:**
- `MobileAppIntegration/` - Mobile configuration docs
- `capacitor.config.ts` - Capacitor configuration
- `android/` - Android native project

---

## 📅 Booking & Viewing System

Schedule property viewings with landlords.

**Features:**
- Select available time slots
- Request property viewings
- Landlord approval workflow
- Email notifications for both parties

**Key Files:**
- `modules/bookings/` - Booking backend
- `app/property/[id]/booking/` - Booking UI
