import React from "react";

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  highlightRegions?: Array<{
    id: string;
    region: { x: number; y: number; width: number; height: number };
    type: string;
  }>;
}

export function ComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = "BEFORE",
  afterLabel = "AFTER",
  highlightRegions = [],
}: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = React.useState(50);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsDragging(true);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, newPosition)));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    updatePosition(touch.clientX);
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className={`relative w-full overflow-hidden rounded-lg bg-gray-100 select-none ${
        isDragging ? "cursor-col-resize" : "cursor-col-resize hover:bg-gray-200"
      }`}
    >
      <img src={afterImage} alt={afterLabel} className="w-full h-auto" />

      {/* Highlight regions on after image */}
      {highlightRegions.map((region) => (
        <div
          key={`after-${region.id}`}
          style={{
            position: "absolute",
            left: `${region.region.x * 100}%`,
            top: `${region.region.y * 100}%`,
            width: `${region.region.width * 100}%`,
            height: `${region.region.height * 100}%`,
          }}
          className={`border-2 ${
            region.type === "removed"
              ? "border-red-500"
              : region.type === "moved"
                ? "border-orange-500"
                : "border-yellow-500"
          }`}
        />
      ))}

      {/* Before image clipped by slider */}
      <div
        style={{ width: `${sliderPosition}%` }}
        className="absolute inset-0 overflow-hidden"
      >
        <img src={beforeImage} alt={beforeLabel} className="w-screen h-auto" />

        {/* Highlight regions on before image */}
        {highlightRegions.map((region) => (
          <div
            key={`before-${region.id}`}
            style={{
              position: "absolute",
              left: `${region.region.x * 100}%`,
              top: `${region.region.y * 100}%`,
              width: `${region.region.width * 100}%`,
              height: `${region.region.height * 100}%`,
            }}
            className={`border-2 ${
              region.type === "removed"
                ? "border-red-500"
                : region.type === "moved"
                  ? "border-orange-500"
                  : "border-yellow-500"
            }`}
          />
        ))}
      </div>

      {/* Slider line and handle */}
      <div
        style={{ left: `${sliderPosition}%` }}
        className="absolute inset-y-0 w-1 bg-white shadow-lg transform -translate-x-1/2 transition-opacity"
      >
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-md p-2 hover:shadow-lg transition"
          onMouseDown={handleMouseDown}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sliderPosition)}
          tabIndex={0}
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M8.5 3a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9 13a1 1 0 11-2 0 1 1 0 012 0zm6 0a1 1 0 11-2 0 1 1 0 012 0zM9 17a1 1 0 11-2 0 1 1 0 012 0zm6 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-xs font-medium pointer-events-none">
        {beforeLabel}
      </div>

      <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-xs font-medium pointer-events-none">
        {afterLabel}
      </div>
    </div>
  );
}
