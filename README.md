# WHAT CHANGED?

Don't compare pictures. Understand what changed.

## Product Vision

A focused web application that compares two real-world images (BEFORE and AFTER) and identifies **meaningful real-world changes**, rather than simply showing pixel differences.

## Features

- **Image Upload**: Drag-and-drop or browse to upload BEFORE and AFTER images
- **Image Comparison**: Multiple viewing modes:
  - Side-by-side comparison
  - Interactive slider (drag to compare)
- **Change Detection**: Identifies and categorizes meaningful changes
  - Added
  - Removed
  - Moved
  - Damaged
  - Modified
  - Uncertain
- **Evidence View**: Click any detected change to see:
  - Before/after crops of the specific region
  - Detailed observation
  - Confidence level
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide Icons (icons)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Production Build

```bash
npm run build
```

Output will be in the `dist/` directory.

## Project Structure

```
src/
├── components/
│   ├── upload/        # Image upload and preview
│   ├── comparison/     # Comparison viewers (side-by-side, slider)
│   └── analysis/       # Analysis UI (progress, change cards, evidence)
├── services/          # Image analysis service
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── App.tsx            # Main application component
```

## How It Works

1. **Upload**: User uploads BEFORE and AFTER images
2. **Analyze**: Click "COMPARE IMAGES" to analyze
3. **Review**: View detected changes with:
   - Summary of total changes
   - Interactive change cards
   - Comparison slider/side-by-side view
4. **Inspect**: Click "VIEW EVIDENCE" on any change to see details
5. **Reset**: Start a new comparison

## Analysis Service

The analysis service (`src/services/imageAnalysis.ts`) provides a clean abstraction for image comparison. Currently uses demo data with 3 sample changes. To integrate with a real AI provider:

1. Update `analyzeImages()` function to call your API
2. Keep API keys server-side
3. Ensure image privacy by not storing them permanently

## Supported Image Formats

- JPG/JPEG
- PNG
- WEBP

Maximum file size: 10MB

## Privacy

- Images are not permanently stored
- Processed in-memory and cleared after analysis
- No image data is logged
- Clear/Reset functionality available

## Demo Mode

The current implementation includes demo analysis results to demonstrate the core experience. This is placeholder data that works immediately.

## Future Enhancements

- Real AI-powered image analysis integration
- Additional comparison visualization modes
- Change history and export
- Batch processing
- API integration for external use
