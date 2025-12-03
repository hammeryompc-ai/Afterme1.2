# Afterme App Resources

This directory contains the source assets for generating app icons and splash screens.

## Required Files

### icon.png (1024 x 1024 pixels)

The master app icon used to generate all platform-specific icon sizes.

**Requirements:**
- Size: 1024 x 1024 pixels
- Format: PNG
- Color: RGB (no alpha/transparency for App Store)
- Shape: Square (rounded corners applied automatically by OS)

**Design Tips:**
- Keep important elements in the center (safe zone)
- Use simple, recognizable imagery
- Test at small sizes (29x29, 40x40)
- Avoid text that becomes unreadable at small sizes
- Use bold colors that stand out

### splash.png (2732 x 2732 pixels)

The master splash screen image used for app launch screens.

**Requirements:**
- Size: 2732 x 2732 pixels (iPad Pro 12.9" scale)
- Format: PNG
- Color: RGB
- Background: Should match app's primary color (#1a1a2e)

**Design Tips:**
- Center your logo/branding
- Keep safe area of ~800x800 in center
- Use app's brand colors
- Simple, clean design

## Generating Icons

### Using Capacitor Assets (Recommended)

1. Install Capacitor Assets:
   ```bash
   npm install -g @capacitor/assets
   ```

2. Place your `icon.png` and `splash.png` in this directory

3. Generate all platform icons:
   ```bash
   npx capacitor-assets generate
   ```

### Using Online Tools

- [AppIcon.co](https://appicon.co/) - Free icon generator
- [MakeAppIcon](https://makeappicon.com/) - Comprehensive tool
- [Icon Kitchen](https://icon.kitchen/) - Android adaptive icons

### Using Native Tools

**Android (Android Studio):**
1. Right-click `res` folder
2. New → Image Asset
3. Select source image
4. Configure foreground/background layers

**iOS (Xcode):**
1. Open Assets.xcassets
2. Select AppIcon
3. Drag 1024x1024 icon
4. Xcode generates all sizes

## Directory Structure After Generation

```
resources/
├── icon.png              # Master icon (1024x1024)
├── splash.png            # Master splash (2732x2732)
├── android/              # Generated Android icons
│   ├── icon/
│   └── splash/
└── ios/                  # Generated iOS icons
    ├── icon/
    └── splash/
```

## Brand Colors

For Afterme, use these brand colors:

- **Primary**: #1a1a2e (Dark navy)
- **Secondary**: #16213e (Deep blue)
- **Accent**: #e94560 (Coral red)
- **Background**: #0f0f1a (Near black)
- **Text**: #ffffff (White)

## Placeholder

Until you have final assets, you can use placeholder images:

```bash
# Generate placeholder icon (requires ImageMagick)
convert -size 1024x1024 xc:#1a1a2e \
  -fill '#e94560' -font Arial -pointsize 200 \
  -gravity center -annotate 0 'A' \
  icon.png

# Generate placeholder splash
convert -size 2732x2732 xc:#1a1a2e \
  -fill '#e94560' -font Arial -pointsize 400 \
  -gravity center -annotate 0 'Afterme' \
  splash.png
```
