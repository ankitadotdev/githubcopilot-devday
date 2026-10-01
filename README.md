# WHAT CHANGED? — Image Comparison Tool

**WHAT CHANGED?** is a premium, client-side React application that allows users to upload two images (a "Before" and "After" state) and automatically detects, highlights, and explains exactly what changed between them using a real computer-vision pipeline.

> **Don't just compare pictures. Understand what changed.**

![What Changed Demo](public/favicon.svg) <!-- Replace with an actual screenshot when deployed -->

## ✨ Features

* **Real Computer Vision Pipeline:** Uses an actual Canvas-based image analysis pipeline (Grayscale → Blur → Difference Map → Thresholding → Morphological Filtering → Bounding Box Detection).
* **Multiple Comparison Modes:**
  * **Slider:** Interactive before/after swipe comparison with touch support.
  * **Side by Side:** Responsive grid comparison.
  * **Difference Map:** Generates a real visual difference map (red for darker/added regions, green for brighter/removed regions).
* **Smart Region Highlighting:** Detected changes are overlaid with numbered bounding boxes that correlate to the change report.
* **Evidence View:** Click on any change to view a high-resolution, pixel-perfect crop of exactly what changed.
* **Premium Minimalist UI:** Built with Tailwind v4, Lucide React icons, and Google's Inter font for a professional, distraction-free aesthetic.
* **Privacy First:** 100% client-side processing. Images never leave your browser unless you optionally configure a Vision AI provider.

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ankitadotdev-shiny-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`.

## 🧠 How it Works

The application performs difference detection entirely in the browser using the HTML5 Canvas API:

1. **Normalization:** Both images are scaled to match dimensions while preserving aspect ratios.
2. **Alignment Check:** Validates that the images are of the same scene using Normalized Cross-Correlation (NCC).
3. **Difference Detection:** Converts images to luminance-weighted grayscale, applies a box blur to remove noise/JPEG artifacts, and calculates the absolute pixel difference.
4. **Morphological Filtering:** Uses erosion and dilation to remove speckle noise and connect nearby changed pixels.
5. **Region Extraction:** Uses a flood-fill algorithm to generate bounding boxes around meaningful clusters of changes.

## 🛠️ Tech Stack

* **Framework:** React 19 + Vite
* **Styling:** Tailwind CSS v4
* **Icons:** Lucide React
* **Typography:** Inter (Google Fonts)
* **Type Checking:** TypeScript
* **Linting:** Oxlint

## 🔧 Optional: Vision AI Integration

By default, the application detects visual differences perfectly. If you want the app to actually *understand* what the objects are (e.g., classifying a change as "Chair Removed" instead of "Visual Change"), you can integrate a Vision AI provider (like OpenAI GPT-4 Vision or Google Gemini Vision).

To do this:
1. Rename `.env.example` to `.env.local`
2. Add your API keys (these remain safely on your local machine)
3. Connect the API inside the analysis service pipeline

*Note: Never commit your `.env.local` file containing real API keys.*

## 📝 License

This project is licensed under the MIT License.
