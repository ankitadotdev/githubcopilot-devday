import { useState, useEffect } from "react";
import { ArrowRight, Image as ImageIcon, Sparkles, ScanEye, Zap, GripVertical } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

// Interactive CSS-based Mockup of the Comparison Slider
function HeroInteractiveMockup() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play the slider slightly to draw attention if not hovered
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setSliderPosition(() => {
        const time = Date.now() / 1500; // Speed
        return 50 + Math.sin(time) * 30; // Oscillate between 20% and 80%
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div 
      className="relative w-full max-w-3xl mx-auto h-[300px] md:h-[400px] rounded-2xl overflow-hidden glass-panel border border-white/60 shadow-2xl animate-float cursor-ew-resize"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={(e) => {
        if (!isHovered) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        setSliderPosition(x);
      }}
    >
      {/* Background (After State) */}
      <div className="absolute inset-0 bg-gray-50 p-6 flex flex-col gap-4">
        {/* Fake Dashboard UI */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
          <div className="w-32 h-6 bg-gray-200 rounded-md"></div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="flex-1 flex gap-4 mt-2">
          <div className="flex-[2] bg-gray-200 rounded-xl h-full"></div>
          
          {/* THE CHANGE: Added item highlighted with a semantic marker */}
          <div className="flex-1 bg-green-100 rounded-xl h-full border-2 border-green-500 relative flex items-center justify-center">
             <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shadow-sm z-20">1</div>
             <Sparkles className="text-green-600 animate-pulse-slow" size={32} />
          </div>
        </div>
      </div>

      {/* Foreground (Before State) - Clipped */}
      <div 
        className="absolute inset-0 bg-white p-6 flex flex-col gap-4 overflow-hidden border-r-2 border-white"
        style={{ width: `${sliderPosition}%` }}
      >
        <div className="min-w-[700px] h-full flex flex-col gap-4">
          <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
            <div className="w-32 h-6 bg-gray-200 rounded-md"></div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="flex-1 flex gap-4 mt-2">
            <div className="flex-[2] bg-gray-200 rounded-xl h-full"></div>
            
            {/* THE MISSING CHANGE: Empty space where the new item will be */}
            <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl h-full"></div>
          </div>
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-gray-900 z-30 transition-none pointer-events-none"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <GripVertical size={16} className="text-white" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-gray-900/80 text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider backdrop-blur-sm z-40 pointer-events-none">
        Before
      </div>
      <div className="absolute top-4 right-4 bg-green-600/90 text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider backdrop-blur-sm z-40 pointer-events-none">
        After
      </div>
    </div>
  );
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-200/50 via-[#fafafa] to-[#fafafa] -z-10"></div>
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>

      {/* Header */}
      <header className="border-b border-white/40 bg-white/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
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
      <main className="flex-1 flex flex-col items-center text-center px-5 pt-16 md:pt-24 pb-20">
        
        {/* Animated Badge */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-bold tracking-wide text-gray-600 mb-8 uppercase">
            <Sparkles size={14} className="text-amber-500" />
            <span>Computer Vision inside your browser</span>
          </div>
        </div>
        
        {/* Headline */}
        <h1 className="opacity-0 animate-fade-in-up text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight max-w-4xl leading-[1.1]" style={{ animationDelay: "0.2s" }}>
          Don't just compare pictures.<br />
          <span className="text-gradient">
            Understand what changed.
          </span>
        </h1>
        
        {/* Subheadline */}
        <p className="opacity-0 animate-fade-in-up mt-8 text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed" style={{ animationDelay: "0.3s" }}>
          Upload a before and after image, and our client-side computer vision engine will instantly analyze, highlight, and extract every single pixel that changed.
        </p>

        {/* CTA Buttons */}
        <div className="opacity-0 animate-fade-in-up mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto z-10" style={{ animationDelay: "0.4s" }}>
          <button
            onClick={onStart}
            className="bg-gray-900 text-white font-semibold rounded-xl px-8 py-4 w-full sm:w-auto text-lg transition-all hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
          >
            Start Comparing Now
            <ArrowRight size={20} />
          </button>
          <button
            onClick={onStart}
            className="bg-white text-gray-700 font-semibold rounded-xl px-8 py-4 w-full sm:w-auto text-lg border border-gray-200 transition-all hover:bg-gray-50 hover:shadow-md flex items-center justify-center gap-3"
          >
            Try a Demo
          </button>
        </div>

        {/* Interactive Mockup */}
        <div className="opacity-0 animate-fade-in-up w-full mt-16 md:mt-24 perspective-1000" style={{ animationDelay: "0.5s" }}>
          <HeroInteractiveMockup />
        </div>

        {/* Feature Grid */}
        <div className="opacity-0 animate-fade-in-up mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full text-left" style={{ animationDelay: "0.6s" }}>
          <div className="glass-panel p-8 rounded-3xl hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
              <ScanEye size={28} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Pixel-Perfect Detection</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Advanced morphological filtering and difference mapping detects even the smallest structural changes while completely ignoring lighting differences and JPEG artifacts.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
              <ImageIcon size={28} className="text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Visual Evidence Crops</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Don't just take our word for it. Review auto-generated, high-resolution Canvas crops showing a direct side-by-side view of exactly what was added, removed, or moved.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 border border-green-100">
              <Zap size={28} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">100% Client-Side Privacy</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Your sensitive images never leave your browser. All analysis, blurring, thresholding, and comparison happens locally on your machine for ultimate security and speed.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
