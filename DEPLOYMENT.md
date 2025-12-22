# Afterme Deployment Guide

This guide covers deploying Afterme to production, including backend services and mobile app stores.

## Table of Contents

1. [Backend Deployment](#backend-deployment)
2. [Google Play Store Deployment](#google-play-store-deployment)
3. [Apple App Store Deployment](#apple-app-store-deployment)
4. [Environment Configuration](#environment-configuration)

---

## Backend Deployment

### Option 1: Railway Deployment

Railway is a modern cloud platform that makes deployment simple.

#### Prerequisites
- Railway account ([railway.app](https://railway.app))
- GitHub account linked to Railway

#### Steps

1. **Create New Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   railway init
   ```

2. **Configure Services**
   - Add MongoDB plugin or connect to MongoDB Atlas
   - Deploy backend service from `packages/backend`
   - Deploy AI service from `packages/ai-service`

3. **Set Environment Variables**
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secure-jwt-secret
   AI_SERVICE_URL=https://your-ai-service.railway.app
   PORT=5000
   NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### Option 2: Render Deployment

Render provides free tier options and easy scaling.

#### Steps

1. **Create Web Services**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect GitHub repository
   
2. **Configure Backend Service**
   - Root Directory: `packages/backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   
3. **Configure AI Service**
   - Root Directory: `packages/ai-service`
   - Docker deployment recommended
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python src/main.py`

4. **Set Environment Variables** (same as Railway)

### MongoDB Atlas Setup

1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free M0 cluster
3. Configure network access (allow from anywhere for cloud deployment)
4. Create database user
5. Get connection string and add to environment variables

### SSL/HTTPS Configuration

- Railway and Render provide automatic SSL
- For custom domains, add CNAME record pointing to your service
- SSL certificates are provisioned automatically

---

## Google Play Store Deployment

### Prerequisites

- Google Play Console account ($25 one-time fee)
- Android Studio installed
- Java Development Kit (JDK) 17+

### Step 1: Generate Signed APK/AAB

1. **Create Keystore**
   ```bash
   cd packages/frontend
   
   # Generate keystore (keep this file secure!)
   keytool -genkey -v -keystore afterme-release.keystore \
     -alias afterme -keyalg RSA -keysize 2048 -validity 10000
   ```
   
   **⚠️ IMPORTANT**: Store the keystore and passwords securely. Losing them means you cannot update your app.

2. **Configure Signing in Android Studio**
   - Open `packages/frontend/android` in Android Studio
   - Go to Build → Generate Signed Bundle / APK
   - Select Android App Bundle (AAB) for Play Store
   - Select your keystore file
   - Enter keystore password and key alias

3. **Build Release APK/AAB**
   ```bash
   # Build the web app first
   npm run build
   
   # Sync with Capacitor
   npx cap sync android
   
   # Open in Android Studio
   npx cap open android
   ```
   
   In Android Studio: Build → Generate Signed Bundle / APK

### Step 2: Required Assets

Prepare these assets before submission:

| Asset | Size | Requirements |
|-------|------|--------------|
| App Icon | 512 x 512 px | PNG, 32-bit, no alpha |
| Feature Graphic | 1024 x 500 px | PNG or JPEG |
| Phone Screenshots | Min 2 | 16:9 or 9:16 aspect ratio |
| 7" Tablet Screenshots | Optional | Recommended |
| 10" Tablet Screenshots | Optional | Recommended |

### Step 3: Store Listing

1. **Create App in Play Console**
   - Go to [play.google.com/console](https://play.google.com/console)
   - Click "Create app"
   - Fill in app details

2. **Store Listing Information**
   - Short description (80 characters max)
   - Full description (4000 characters max)
   - App category: Social/Communication
   - Tags and keywords

3. **Content Rating**
   - Complete content rating questionnaire
   - Afterme likely rates: Teen (social features, chat)

4. **Privacy Policy** (Required)
   - Host privacy policy on your website
   - Include data collection and usage
   - Required URL in store listing

### Step 4: App Review

- Initial review: 1-3 days
- Updates: Usually faster
- Common rejection reasons:
  - Missing privacy policy
  - Broken functionality
  - Policy violations

---

## Apple App Store Deployment

### Prerequisites

- Apple Developer account ($99/year)
- Mac with Xcode 15+
- iOS device for testing (recommended)

### Step 1: Configure Xcode Project

1. **Open iOS Project**
   ```bash
   cd packages/frontend
   npm run build
   npx cap sync ios
   npx cap open ios
   ```

2. **Configure Signing**
   - Select "App" target
   - Go to Signing & Capabilities
   - Select your team (Apple Developer account)
   - Automatic signing recommended

3. **Set Bundle Identifier**
   - Bundle ID: `com.afterme.app`
   - Ensure it matches `capacitor.config.ts`

### Step 2: Certificates and Provisioning

1. **Create App ID**
   - Go to [developer.apple.com/account](https://developer.apple.com/account)
   - Certificates, Identifiers & Profiles
   - Register new App ID
   - Bundle ID: `com.afterme.app`

2. **Create Provisioning Profile**
   - App Store Distribution profile
   - Select your App ID
   - Download and install in Xcode

### Step 3: Required Assets

| Asset | Size | Requirements |
|-------|------|--------------|
| App Icon | 1024 x 1024 px | PNG, no alpha, no rounded corners |
| iPhone 6.7" Screenshots | Required | 1290 x 2796 px |
| iPhone 6.5" Screenshots | Required | 1242 x 2688 px |
| iPhone 5.5" Screenshots | Required | 1242 x 2208 px |
| iPad Pro 12.9" Screenshots | If iPad support | 2048 x 2732 px |

### Step 4: Archive and Upload

1. **Create Archive**
   - Product → Archive in Xcode
   - Wait for build to complete

2. **Upload to App Store Connect**
   - Window → Organizer
   - Select archive → Distribute App
   - App Store Connect → Upload

### Step 5: App Store Connect

1. **Create App**
   - Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - My Apps → New App
   - Fill in app information

2. **App Information**
   - Name: Afterme
   - Subtitle (optional)
   - Privacy Policy URL (required)
   - Category: Social Networking

3. **Version Information**
   - Screenshots for all device sizes
   - Description and keywords
   - What's new (for updates)
   - Support URL

4. **App Privacy**
   - Complete App Privacy questionnaire
   - Data types collected
   - Data usage purposes
   - Data linked to user

### Step 6: App Review

- Initial review: 1-7 days (usually 24-48 hours)
- Common rejection reasons:
  - Guideline 4.2: Minimum functionality
  - Guideline 5.1.1: Data collection/privacy
  - Crashes or bugs
  - Incomplete metadata

### App Review Guidelines Tips

- Ensure all features work offline or show appropriate messaging
- Include demo account if login required
- Test on actual devices before submission
- Provide clear privacy policy
- Respond promptly to reviewer questions

---

## Environment Configuration

### Production Environment Variables

#### Backend Service

```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/afterme

# Authentication
JWT_SECRET=your-very-secure-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d

# AI Service
AI_SERVICE_URL=https://your-ai-service.domain.com

# CORS
ALLOWED_ORIGINS=https://afterme.app,https://www.afterme.app

# Optional: File Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=afterme-uploads
AWS_REGION=us-east-1
```

#### AI Service

```env
# Server
PORT=6000
FLASK_ENV=production

# Model Configuration
MODEL_PATH=/models
MAX_AUDIO_LENGTH=30

# Backend API
BACKEND_API_URL=https://your-backend.domain.com
API_KEY=your-internal-api-key
```

### Mobile App Configuration

For production mobile builds, update `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.afterme.app',
  appName: 'Afterme',
  webDir: 'dist',
  server: {
    // Remove localhost configuration for production
    androidScheme: 'https',
  },
  // ... rest of config
};
```

### Security Considerations

1. **API Keys**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys periodically

2. **JWT Secrets**
   - Use minimum 32-character secrets
   - Different secrets for different environments

3. **Database Security**
   - Use strong passwords
   - Enable IP whitelisting where possible
   - Regular backups

4. **HTTPS**
   - Always use HTTPS in production
   - Enable HSTS headers
   - Certificate auto-renewal

5. **Mobile Security**
   - Certificate pinning (optional, advanced)
   - ProGuard/R8 obfuscation for Android
   - Secure storage for sensitive data

---

## Troubleshooting

### Common Issues

**Android: App crashes on startup**
- Check ProGuard rules
- Verify all native dependencies
- Check logcat for errors

**iOS: Build fails**
- Clean build folder (Cmd + Shift + K)
- Delete Derived Data
- Run `pod install` again

**Backend: Connection issues**
- Verify environment variables
- Check CORS configuration
- Verify MongoDB connection string

### Support

- GitHub Issues: [repo-issues-link]
- Email: support@afterme.app
- Documentation: [docs-link]
