import React from "react";

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function ComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = "BEFORE",
  afterLabel = "AFTER",
}: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = React.useState(50);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, newPosition)));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const newPosition = ((touch.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, newPosition)));
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative w-full cursor-col-resize overflow-hidden rounded-lg bg-gray-100"
    >
      <img src={afterImage} alt={afterLabel} className="w-full h-auto" />

      <div
        style={{ width: `${sliderPosition}%` }}
        className="absolute inset-0 overflow-hidden"
      >
        <img src={beforeImage} alt={beforeLabel} className="w-screen h-auto" />
      </div>

      <div
        style={{ left: `${sliderPosition}%` }}
        className="absolute inset-y-0 w-1 bg-white shadow-lg transform -translate-x-1/2"
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-md p-2">
          <svg
            className="w-5 h-5 text-gray-700"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M8.5 3a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9 13a1 1 0 11-2 0 1 1 0 012 0zm6 0a1 1 0 11-2 0 1 1 0 012 0zM9 17a1 1 0 11-2 0 1 1 0 012 0zm6 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </div>
      </div>

      <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-xs font-medium">
        {beforeLabel}
      </div>

      <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-xs font-medium">
        {afterLabel}
      </div>
    </div>
  );
}
