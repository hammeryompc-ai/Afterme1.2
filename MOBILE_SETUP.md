# Afterme Mobile Setup Guide

This guide walks you through setting up the mobile development environment for Afterme.

## Prerequisites

### General Requirements

- Node.js 18+ and npm 9+
- Git

### Android Development

- Android Studio (Arctic Fox or newer)
- Android SDK 34
- Java Development Kit (JDK) 17
- Android Emulator or physical device

### iOS Development (Mac only)

- macOS 12+ (Monterey or newer)
- Xcode 14+
- CocoaPods
- iOS Simulator or physical device

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-org/afterme.git
cd afterme

# Install all dependencies
npm run install-all

# Or specifically for mobile
npm run mobile:setup
```

## Step 2: Build the Web App

```bash
# Build the frontend
npm run build

# This creates the dist/ folder that Capacitor wraps
```

## Step 3: Initialize Capacitor (First Time Only)

If this is your first time setting up the project, Capacitor may need initialization:

```bash
cd packages/frontend

# Sync web app with native projects
npx cap sync
```

## Step 4: Platform-Specific Setup

### Android Setup

1. **Install Android Studio**
   - Download from [developer.android.com/studio](https://developer.android.com/studio)
   - Follow installation wizard
   - Install Android SDK 34 via SDK Manager

2. **Configure SDK Path**
   
   Add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):
   
   ```bash
   # macOS/Linux
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   
   # Windows (add to Environment Variables)
   # ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
   ```

3. **Create Android Virtual Device**
   - Open Android Studio
   - Tools → Device Manager
   - Create Device → Select Pixel 6 or similar
   - Select system image (API 34)
   - Finish

4. **Open Android Project**
   ```bash
   # From project root
   npm run mobile:android
   
   # Or manually
   cd packages/frontend
   npx cap open android
   ```

5. **Run on Emulator/Device**
   - Click the green "Run" button in Android Studio
   - Select your emulator or connected device

### iOS Setup (Mac Only)

1. **Install Xcode**
   - Download from Mac App Store
   - Open Xcode once to install additional components
   - Accept license: `sudo xcodebuild -license accept`

2. **Install CocoaPods**
   ```bash
   sudo gem install cocoapods
   
   # Or with Homebrew
   brew install cocoapods
   ```

3. **Install iOS Dependencies**
   ```bash
   cd packages/frontend/ios/App
   pod install
   ```

4. **Open iOS Project**
   ```bash
   # From project root
   npm run mobile:ios
   
   # Or manually
   cd packages/frontend
   npx cap open ios
   ```

5. **Configure Signing**
   - Select "App" target in Xcode
   - Signing & Capabilities tab
   - Select your team (requires Apple Developer account for device testing)

6. **Run on Simulator/Device**
   - Select target device (e.g., iPhone 15 Pro)
   - Click the "Run" button (▶)

## Step 5: Development Workflow

### Making Changes

1. **Edit web code** in `packages/frontend/src/`

2. **Rebuild and sync**
   ```bash
   npm run build
   cd packages/frontend
   npx cap sync
   ```

3. **Run in native IDE**
   - Changes appear after rebuild

### Live Reload (Development Only)

For faster iteration, enable live reload:

1. **Edit `capacitor.config.ts`**
   ```typescript
   server: {
     url: 'http://YOUR_LOCAL_IP:3000',
     cleartext: true,
   },
   ```

2. **Find your IP address**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```

3. **Start dev server and sync**
   ```bash
   npm run dev --workspace=packages/frontend
   npx cap sync
   ```

4. **Run app** - it will connect to your dev server

⚠️ **Remember to remove live reload config before building for production!**

## Step 6: Add App Icons and Splash Screens

1. **Create source images**
   - `packages/frontend/resources/icon.png` (1024x1024)
   - `packages/frontend/resources/splash.png` (2732x2732)

2. **Generate all sizes**
   ```bash
   npm install -g @capacitor/assets
   npx capacitor-assets generate
   ```

3. **Sync to native projects**
   ```bash
   npx cap sync
   ```

## Troubleshooting

### Android Issues

**Problem: Gradle sync failed**
```bash
cd packages/frontend/android
./gradlew clean
./gradlew --refresh-dependencies
```

**Problem: SDK not found**
- Verify ANDROID_HOME environment variable
- Check SDK Manager has Android 34 installed

**Problem: Emulator won't start**
- Enable hardware acceleration (VT-x/AMD-V)
- Allocate more RAM to emulator

### iOS Issues

**Problem: Pod install fails**
```bash
cd packages/frontend/ios/App
pod deintegrate
pod install --repo-update
```

**Problem: Signing error**
- Ensure you have Apple Developer account
- Select correct team in Xcode
- Check provisioning profiles

**Problem: Build error after Xcode update**
```bash
# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### General Issues

**Problem: Changes not appearing**
```bash
# Full rebuild
npm run build
npx cap sync
# Then run from IDE
```

**Problem: WebView shows old content**
- Clear app data on device
- Uninstall and reinstall app

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run mobile:setup` | Install dependencies |
| `npm run build` | Build web app |
| `npm run mobile:android` | Build and open Android Studio |
| `npm run mobile:ios` | Build and open Xcode |
| `npm run mobile:sync` | Sync changes to native projects |

## Next Steps

1. Add your app icons (see `packages/frontend/resources/README.md`)
2. Test on real devices
3. See `DEPLOYMENT.md` for publishing to app stores

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio/intro)
- [Xcode Documentation](https://developer.apple.com/documentation/xcode)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Play Store Policies](https://play.google.com/about/developer-content-policy/)
