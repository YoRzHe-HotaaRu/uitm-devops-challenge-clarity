# 📚 How to Use RentVerse

A comprehensive guide for users, landlords, and administrators.

---

## 🌐 Quick Access

| Platform | URL |
|----------|-----|
| **Live Website** | [https://rentverse-frontend-nine.vercel.app](https://rentverse-frontend-nine.vercel.app/) |
| **Mobile App** | [Download APK](MobileAppBuild/rentverse-clarity.apk) |
| **API Documentation** | `/docs` (Swagger UI) |

---

## 👤 For Tenants (Regular Users)

### Getting Started

#### 1. Create an Account
1. Visit the website and click **"Sign Up"**
2. Fill in your details:
   - Email address
   - Password (minimum 8 characters with uppercase, lowercase, and number)
   - First and last name
3. Verify your email with the OTP code sent to your inbox
4. Login with your credentials

#### 2. Multi-Factor Authentication (Auto-Enabled)
MFA is **automatically enabled** when you create an account. Each time you login:
1. Enter your email and password
2. Check your email for a 6-digit OTP code
3. Enter the OTP to complete login

> **Note**: This adds an extra layer of security to protect your account.

---

### Browsing Properties

#### Search for Properties
1. On the homepage, use the **Search Box** to enter:
   - Location (city, state, or area)
   - Property type (Room, Apartment, Condo, House, etc.)
   - Price range
   - Rental duration (Monthly, Yearly)
2. Click **"Search"** to view results

#### View Property Details
1. Click on any property card to see full details:
   - Photo gallery (swipe through images)
   - Property description and amenities
   - Location on map
   - Price and rental terms
   - Landlord information

#### Save to Wishlist
1. Click the **heart icon (❤️)** on any property to save it
2. Access saved properties at **Account** → **Wishlist**

---

### Booking a Property

#### Request a Viewing
1. On the property details page, click **"Book Viewing"**
2. Select an available date and time
3. Add any notes for the landlord
4. Submit your request

#### Complete a Rental
1. Once your booking is approved, you'll receive a notification
2. Go to **Account** → **Bookings** to view status
3. When ready, the landlord will create a **Digital Agreement**

---

### Managing Agreements

#### View Your Agreements
1. Go to **My Agreements** from the menu
2. See all your rental agreements and their status:
   - `PENDING_TENANT` - Waiting for your signature
   - `COMPLETED` - Both parties signed
   - `ACTIVE` - Currently active lease

#### Sign an Agreement
1. Click on an agreement with status `PENDING_TENANT`
2. Review the lease terms carefully
3. Draw your signature in the signature box
4. Check the confirmation box
5. Click **"Sign Agreement"**
6. Download the signed PDF for your records

---

### Account Management

#### Update Profile
**Account** → **Settings**
- Edit first name, last name
- Update phone number
- Set date of birth

#### View Payment History
**Account** → **Payments**
- See all rent and deposit payments
- Filter by Paid/Pending
- View payment summary

#### Security Settings
**Account** → **Security**
- Change password
- Enable/disable MFA
- View login history

#### Notifications
**Account** → **Notifications**
- Manage email preferences
- Security alerts
- Booking updates

---

### Forgot Password?
1. On the login page, click **"Forgot password?"**
2. Enter your registered email
3. Enter the 6-digit OTP sent to your email
4. Create a new password
5. Login with your new credentials

---

## 🏠 For Property Owners (Landlords)

### Listing a Property

#### Create a New Listing
1. Click **"Add Listing"** from the navigation menu
2. Follow the 3-step wizard:

**Step 1: Basic Information**
- Property title and description
- Property type (Room, Apartment, etc.)
- Select location on the map
- Enter full address

**Step 2: Photos & Details**
- Upload property photos (drag & drop)
- Specify number of bedrooms/bathrooms
- Select available amenities
- Set square footage

**Step 3: Pricing & Terms**
- Set rental price
- Specify security deposit
- Choose rental duration (Monthly/Yearly)
- Add house rules

3. Click **"Publish"** to make your listing live

#### Manage Your Properties
1. Go to **My Properties** from account menu
2. View all your listings
3. Edit, pause, or delete listings as needed

---

### Handling Bookings

#### View Booking Requests
1. Go to **Account** → **Bookings**
2. See all pending viewing requests
3. Approve or reject with a message

#### Create Rental Agreement
1. After approving a booking, click **"Create Agreement"**
2. Review the auto-generated lease terms
3. Sign as landlord first
4. The tenant will receive a notification to counter-sign

---

### Agreement Workflow

```
1. Create Lease → PDF Generated
2. Landlord Signs → Status: PENDING_TENANT
3. Tenant Signs → Status: COMPLETED
4. Both Parties → Receive Final PDF
```

---

## 👑 For Administrators

### Accessing Admin Panel
1. Login with an admin account
2. Go to **Admin** from the navigation menu
3. Access URL: [https://rentverse-frontend-nine.vercel.app/admin](https://rentverse-frontend-nine.vercel.app/admin)

> **Note**: Only users with the `ADMIN` role can access the admin panel. Regular users will see an "Access Denied" message.

---

### Admin Dashboard Overview
**Admin** → **Dashboard**

The main dashboard provides a quick overview of platform activity:

| Metric | Description |
|--------|-------------|
| **Total Pending** | Properties awaiting admin review |
| **Awaiting Review** | Properties with `PENDING` status |
| **Submitted Today** | New property listings submitted today |

#### Navigation Tabs
From the dashboard, you can access:
- **Dashboard** - Main overview and property approvals
- **Agreements** - Manage rental agreements
- **Properties** - All property management
- **Users** - User account management
- **Security** - Security monitoring and logs

---

### Property Approval Workflow

When landlords submit new property listings, they require admin approval before going live.

#### Reviewing Pending Properties
1. On the **Dashboard**, scroll down to see **"Properties Pending Approval"**
2. Each pending property displays:
   - Property image and title
   - Address and location
   - Price per month
   - Property details (bedrooms, bathrooms, area, furnishing)
   - Owner name and email
   - Property type
   - Submission date
   - Description

#### Approving a Property
1. Click **"Approve"** (green button) on the property card
2. The property status changes to `APPROVED`
3. The property becomes visible to all users on the platform
4. The landlord receives notification of approval

#### Rejecting a Property
1. Click **"Reject"** (red button) on the property card
2. The property status changes to `REJECTED`
3. The property will not be visible to users
4. The landlord receives notification with rejection reason

#### View Full Property Details
Click **"View Property"** on any pending listing to see the complete property page before making a decision.

---

### RevAI Auto Review (AI-Powered)

RentVerse includes an innovative **AI-powered auto-review system** called **RevAI**.

#### How It Works
- When enabled, new property submissions are automatically reviewed by AI
- The AI analyzes property details, images, and descriptions
- Properties meeting quality standards are auto-approved
- Suspicious or incomplete listings are flagged for manual review

#### Toggling Auto Review
1. On the Dashboard, find the **"Auto review"** section
2. Click the toggle switch to enable/disable
3. Status shows **ON** or **OFF**
4. The **RevAI** badge indicates AI-powered functionality

> **Tip**: Enable auto-review during high-volume periods to reduce manual workload.

---

### Properties Management
**Admin** → **Properties**

Comprehensive management of all platform properties.

#### Dashboard Statistics
| Stat | Description |
|------|-------------|
| **Total** | All properties on platform |
| **Active** | Approved and available properties |
| **Pending** | Awaiting admin review |
| **New (7d)** | Properties created in last 7 days |

#### Filtering Properties
- **All** - View all properties
- **APPROVED** - Only approved listings
- **PENDING** - Awaiting review
- **REJECTED** - Rejected listings

#### Search Functionality
Search by:
- Property title
- Address or location
- Owner name or email

#### Property Actions
| Action | Description |
|--------|-------------|
| **Toggle Availability** | Switch between Active/Inactive status |
| **View** | Open full property details page |
| **View Stats** | See view count and favorite count |

---

### User Management
**Admin** → **Users**

Manage all registered users on the platform.

#### User Statistics
| Stat | Description |
|------|-------------|
| **Total Users** | All registered accounts |
| **Active** | Currently active users |
| **Admins** | Users with ADMIN role |
| **Locked** | Accounts locked due to failed logins |
| **Landlords** | Users who own properties |
| **Tenants** | Users with active leases |
| **MFA Enabled** | Percentage using MFA |

#### Filtering Users
- **All** - View all users
- **ADMIN** - Only admin accounts
- **USER** - Regular user accounts

#### Search Users
Search by name or email address.

#### User Actions
| Action | Description |
|--------|-------------|
| **Activate/Deactivate** | Enable or disable user account |
| **Unlock** | Unlock accounts locked after failed login attempts |
| **View MFA Status** | See if user has MFA enabled |
| **View Properties** | See number of properties owned |

#### User Information Displayed
- Full name and email
- Role badge (ADMIN/USER)
- MFA status indicator
- Lock status (if locked)
- Phone number
- Join date
- Last login date
- Property count

---

### Agreement Management
**Admin** → **Agreements**

Monitor and manage all rental agreements on the platform.

#### Agreement Statistics
- Total agreements count
- Pending signatures (landlord + tenant)
- Completed agreements
- Completion rate percentage
- 7-day trends

#### Agreement Actions
| Action | Description |
|--------|-------------|
| **View All** | See all platform agreements |
| **Filter by Status** | PENDING, COMPLETED, etc. |
| **Search** | Find by property or party name |
| **Download PDF** | Get signed agreement documents |
| **Send Reminder** | Remind pending signers |

---

### Security Dashboard
**Admin** → **Security**

Monitor platform security and investigate suspicious activity.

#### 24-Hour Statistics
| Metric | Description |
|--------|-------------|
| **Total Logins** | All login attempts in 24h |
| **Failed Logins** | Failed authentication attempts |
| **Successful Logins** | Successful authentications |
| **High Risk Logins** | Logins with risk score ≥50 |
| **Alerts Sent** | Security notifications triggered |
| **New Devices** | First-time device logins |
| **Unique Users** | Distinct users who logged in |
| **OAuth Logins** | Google/social sign-ins |
| **Email Logins** | Email/password sign-ins |

#### Login History
- View paginated login history
- Filter by success/failure status
- Search by email or IP address
- See device and location info

#### Security Alerts
- View all security alerts
- Filter by alert type
- See alert details and affected users
- Track 7-day alert trends

#### Security Actions
- **Unlock Accounts** - Manually unlock locked users
- **View Login History** - See specific user's login activity
- **Investigate Activity** - Review suspicious login patterns
- **Export Reports** - Download security data for analysis

---

## 📱 Mobile App Usage

### Installation
1. Download the APK from [MobileAppBuild/rentverse-clarity.apk](MobileAppBuild/rentverse-clarity.apk)
2. Enable "Install from Unknown Sources" in your Android settings
3. Open the APK file to install

### Features Available
- ✅ Browse and search properties
- ✅ View property details with photos
- ✅ Login and authentication
- ✅ Access your wishlist
- ✅ View your agreements
- ✅ Receive push notifications

### Deep Linking
The app supports deep links:
- `rentverseclarity://property/{id}` - Open specific property
- `rentverseclarity://login` - Open login screen

---

## 🔐 Security Best Practices

### For All Users
1. **MFA is Auto-Enabled** - Check email for login OTP codes
2. **Use Strong Passwords** - At least 8 characters with mixed case and numbers
3. **Don't Share OTP** - Never share verification codes
4. **Check Login Alerts** - Review security emails

### For Landlords
1. **Verify Tenants** - Review booking requests carefully
2. **Keep Documents** - Download signed agreements
3. **Report Suspicious Activity** - Contact support if needed

---

## 🆘 Troubleshooting

### Login Issues

| Problem | Solution |
|---------|----------|
| Forgot password | Use "Forgot password?" link |
| Account locked | Wait 15 minutes or contact support |
| MFA not working | Check spam folder for OTP email |
| Can't login | Clear browser cookies and try again |

### Property Issues

| Problem | Solution |
|---------|----------|
| Can't upload photos | Check file size (max 5MB) and format (JPG, PNG, WebP) |
| Map not showing | Refresh page or check internet connection |
| Listing not appearing | Wait for admin approval |

### Agreement Issues

| Problem | Solution |
|---------|----------|
| Can't sign | Ensure you're the correct party (landlord/tenant) |
| PDF not loading | Try downloading instead of viewing |
| Signature not saving | Use a larger signature stroke |

---

## 📞 Getting Help

### Contact Support
- Visit the **Contact** page
- Email support (check footer)
- Use FAQ section for common questions

### Useful Pages
- `/faq` - Frequently Asked Questions
- `/about` - About RentVerse
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy
- `/contact` - Contact Us

---

## 🔄 Quick Reference

### Status Meanings

| Status | Meaning |
|--------|---------|
| `PENDING` | Waiting for action |
| `PENDING_LANDLORD` | Waiting for landlord signature |
| `PENDING_TENANT` | Waiting for tenant signature |
| `ACTIVE` | Currently in effect |
| `COMPLETED` | Successfully finished |
| `CANCELLED` | Cancelled by a party |
| `EXPIRED` | Past deadline |

### User Roles

| Role | Capabilities |
|------|-------------|
| **USER** | Browse, book, sign agreements |
| **ADMIN** | Full platform management |

---

<div align="center">
  <p><i>Built with ❤️ by Team ClaRity</i></p>
  <p>© 2025 RentVerse. All rights reserved.</p>
</div>
