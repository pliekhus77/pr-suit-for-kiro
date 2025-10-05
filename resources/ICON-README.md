# Extension Icon

## Current Status

The extension icon is defined as an SVG file (`icon.svg`) but needs to be converted to PNG format for VS Code marketplace compatibility.

## Requirements

- **Format**: PNG
- **Size**: 128x128 pixels
- **Background**: Should work on both light and dark themes

## Conversion

To convert the SVG to PNG, use one of these methods:

### Method 1: Using ImageMagick
```bash
convert -background none -resize 128x128 icon.svg icon.png
```

### Method 2: Using Inkscape
```bash
inkscape icon.svg --export-png=icon.png --export-width=128 --export-height=128
```

### Method 3: Online Tool
Use an online SVG to PNG converter like:
- https://cloudconvert.com/svg-to-png
- https://svgtopng.com/

## Icon Design

The icon represents:
- **Blue circle**: Framework/system boundary
- **White document**: Steering document/guidance
- **Blue lines**: Content/rules
- **Checkmark**: Validation/quality assurance

This design communicates the extension's purpose: providing validated framework-based guidance.
