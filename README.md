# MHTML to HTML Converter

A simple, browser-based tool to batch convert MHTML/MHT files to clean HTML.

## Features

- **Batch Upload** - Convert multiple MHTML files at once
- **Drag & Drop** - Easy file selection
- **100% Client-Side** - No files uploaded to any server, all processing happens in your browser
- **Download All as ZIP** - Get all converted files in a single ZIP download
- **Preview** - Preview converted HTML before downloading
- **No Dependencies** - Pure HTML/CSS/JS (only JSZip for ZIP generation)

## How to Use

1. Open `index.html` in your browser (or host it on any static hosting)
2. Drag & drop your `.mhtml` or `.mht` files (or click to browse)
3. Click "Convert All to HTML"
4. Download individual files or all as ZIP

## Hosting

This is a static website - just upload these 3 files to any hosting:
- `index.html`
- `style.css`
- `app.js`

Compatible with: GitHub Pages, Netlify, Vercel, data.galaxy.com, or any static file hosting.

## Tech Stack

- HTML5
- CSS3 (Dark theme, responsive)
- Vanilla JavaScript (ES6+)
- JSZip (CDN) for ZIP generation
