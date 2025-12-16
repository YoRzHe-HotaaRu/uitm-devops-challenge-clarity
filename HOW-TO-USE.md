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
2. Go to **Admin** from the navigation

### Dashboard Overview
- View platform statistics
- Monitor recent activity
- Quick access to all admin functions

---

### User Management
**Admin** → **Users**

| Action | Description |
|--------|-------------|
| **View Users** | See all registered users with details |
| **Search** | Find users by name or email |
| **Filter by Role** | Filter by USER or ADMIN |
| **Toggle Status** | Activate or deactivate user account |
| **Unlock Account** | Unlock locked accounts after failed logins |

---

### Property Moderation
**Admin** → **Properties**

| Action | Description |
|--------|-------------|
| **View All** | See all property listings with stats |
| **Search** | Find properties by title or location |
| **Filter by Status** | Filter by Approved, Pending, Rejected |
| **Toggle Availability** | Mark property as available or unavailable |

---

### Agreement Management
**Admin** → **Agreements**

- View all platform agreements
- Download agreement PDFs
- Monitor signing status
- Resolve disputes

---

### Security Dashboard
**Admin** → **Security**

| Metric | Description |
|--------|-------------|
| **Login Statistics** | 24h login success/failure rates |
| **High Risk Logins** | Logins with risk score ≥50 |
| **Locked Accounts** | Currently locked users |
| **Security Alerts** | Recent security events |
| **7-Day Trends** | Login activity charts |

#### Security Actions
- Unlock user accounts
- View login history by user
- Investigate suspicious activity
- Export security reports

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
