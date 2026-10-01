
import { ArrowRight, Image as ImageIcon, Sparkles, ScanEye, Zap } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanEye size={24} className="text-gray-900" />
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              WHAT CHANGED?
            </span>
          </div>
          <button
            onClick={onStart}
            className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition"
          >
            Launch App
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center text-center px-5 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-semibold text-gray-600 mb-8 border border-gray-200">
          <Sparkles size={14} className="text-amber-500" />
          <span>Computer Vision Powered Comparison</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight max-w-4xl leading-[1.1]">
          Don't just compare pictures.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">
            Understand what changed.
          </span>
        </h1>
        
        <p className="mt-8 text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed">
          Upload a before and after image, and our client-side computer vision engine will instantly analyze, highlight, and extract every single pixel that changed.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onStart}
            className="button-primary flex items-center gap-2 text-base px-8 py-4 w-full sm:w-auto"
          >
            Start Comparing Now
            <ArrowRight size={18} />
          </button>
          <a
            href="https://github.com/ankitadotdev/githubcopilot-devday"
            target="_blank"
            rel="noopener noreferrer"
            className="button-secondary flex items-center justify-center gap-2 text-base px-8 py-4 w-full sm:w-auto"
          >
            View on GitHub
          </a>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 card-shadow">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 border border-gray-200">
              <ScanEye size={24} className="text-gray-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Pixel-Perfect Detection</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Advanced morphological filtering and difference mapping detects even the smallest structural changes while ignoring lighting differences and JPEG artifacts.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 card-shadow">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 border border-gray-200">
              <ImageIcon size={24} className="text-gray-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Visual Evidence</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Don't just take our word for it. Review auto-generated, high-resolution Canvas crops showing exactly what was added, removed, or moved.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 card-shadow">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 border border-gray-200">
              <Zap size={24} className="text-gray-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">100% Client-Side</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Your images never leave your browser. All analysis, blurring, thresholding, and comparison happens locally on your machine for ultimate privacy.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
