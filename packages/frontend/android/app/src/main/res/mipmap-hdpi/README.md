# Afterme Android App Icons

## Icon Requirements

The Android app requires icons in multiple resolutions. Place your icons in the corresponding mipmap directories:

### Required Icons

| Directory | Size | DPI | File Name |
|-----------|------|-----|-----------|
| mipmap-mdpi | 48x48 | 160 | ic_launcher.png, ic_launcher_round.png |
| mipmap-hdpi | 72x72 | 240 | ic_launcher.png, ic_launcher_round.png |
| mipmap-xhdpi | 96x96 | 320 | ic_launcher.png, ic_launcher_round.png |
| mipmap-xxhdpi | 144x144 | 480 | ic_launcher.png, ic_launcher_round.png |
| mipmap-xxxhdpi | 192x192 | 640 | ic_launcher.png, ic_launcher_round.png |

### Generation

1. Create a master icon at 1024x1024 pixels
2. Use Android Studio's Image Asset Studio:
   - Open Android Studio
   - Right-click res folder → New → Image Asset
   - Select your master icon
   - Configure adaptive icon layers
   - Generate all sizes automatically

3. Alternative: Use online tools like:
   - https://romannurik.github.io/AndroidAssetStudio/
   - https://appicon.co/

### Adaptive Icons (Android 8.0+)

For modern Android devices, consider creating adaptive icons:
- `ic_launcher_foreground.xml` - Foreground layer
- `ic_launcher_background.xml` - Background layer

Place these in `mipmap-anydpi-v26/` directory.

### Splash Screen

For the splash screen, create:
- `drawable/splash.png` - Center image (512x512 recommended)
- Configure colors in `values/styles.xml`
