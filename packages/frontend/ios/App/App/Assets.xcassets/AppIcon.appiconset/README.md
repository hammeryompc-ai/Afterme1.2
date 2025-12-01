# Afterme iOS App Icons

## Icon Requirements

The iOS app requires icons in multiple sizes. Place your icon files in this directory.

### Required Icons

| File Name | Size | Usage |
|-----------|------|-------|
| Icon-App-20x20@1x.png | 20x20 | iPad Notifications |
| Icon-App-20x20@2x.png | 40x40 | iPhone/iPad Notifications |
| Icon-App-20x20@3x.png | 60x60 | iPhone Notifications |
| Icon-App-29x29@1x.png | 29x29 | iPad Settings |
| Icon-App-29x29@2x.png | 58x58 | iPhone/iPad Settings |
| Icon-App-29x29@3x.png | 87x87 | iPhone Settings |
| Icon-App-40x40@1x.png | 40x40 | iPad Spotlight |
| Icon-App-40x40@2x.png | 80x80 | iPhone/iPad Spotlight |
| Icon-App-40x40@3x.png | 120x120 | iPhone Spotlight |
| Icon-App-60x60@2x.png | 120x120 | iPhone App Icon |
| Icon-App-60x60@3x.png | 180x180 | iPhone App Icon |
| Icon-App-76x76@1x.png | 76x76 | iPad App Icon |
| Icon-App-76x76@2x.png | 152x152 | iPad App Icon |
| Icon-App-83.5x83.5@2x.png | 167x167 | iPad Pro App Icon |
| Icon-App-1024x1024@1x.png | 1024x1024 | App Store |

### Generation

1. Create a master icon at 1024x1024 pixels
2. Use Xcode's Asset Catalog:
   - Open the project in Xcode
   - Navigate to Assets.xcassets → AppIcon
   - Drag your master icon to generate all sizes

3. Alternative: Use online tools like:
   - https://appicon.co/
   - https://makeappicon.com/

### Requirements

- PNG format
- No transparency for App Store icon
- Square corners (iOS applies rounding automatically)
- Simple, recognizable design at all sizes
