import React from "react";
import { GripVertical } from "lucide-react";
import type { ChangeType } from "../../types/analysis";

interface HighlightRegion {
  id: string;
  region: { x: number; y: number; width: number; height: number };
  type: ChangeType | string;
  index: number;
  onClick?: () => void;
}

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  highlightRegions?: HighlightRegion[];
  selectedRegionId?: string | null;
}

const regionBorderColor: Record<string, string> = {
  removed: "#dc2626",
  added: "#16a34a",
  moved: "#d97706",
  modified: "#2563eb",
  uncertain: "#6b7280",
  damaged: "#eab308",
};

export function ComparisonSlider({
  beforeImage,
  afterImage,
  highlightRegions = [],
  selectedRegionId,
}: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = React.useState(50);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  // Track container width for proper before-image sizing
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    setContainerWidth(el.offsetWidth);

    return () => observer.disconnect();
  }, []);

  const updatePosition = React.useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, newPosition)));
  }, []);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const clientX =
        "touches" in e ? e.touches[0].clientX : e.clientX;
      updatePosition(clientX);
    };

    const handleEnd = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMove, { passive: false });
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, updatePosition]);

  const renderRegions = (keyPrefix: string) =>
    highlightRegions.map((r) => {
      const color = regionBorderColor[r.type] || regionBorderColor.uncertain;
      const selected = selectedRegionId === r.id;
      return (
        <div
          key={`${keyPrefix}-${r.id}`}
          onClick={(e) => {
            e.stopPropagation();
            r.onClick?.();
          }}
          className="region-marker"
          style={{
            left: `${r.region.x * 100}%`,
            top: `${r.region.y * 100}%`,
            width: `${r.region.width * 100}%`,
            height: `${r.region.height * 100}%`,
            borderColor: color,
            backgroundColor: selected ? `${color}18` : `${color}08`,
            boxShadow: selected ? `0 0 0 3px ${color}30` : "none",
          }}
        >
          <span
            className="region-number"
            style={{ backgroundColor: color }}
          >
            {r.index + 1}
          </span>
        </div>
      );
    });

  return (
    <div
      ref={containerRef}
      className="comparison-slider relative w-full overflow-hidden rounded-lg bg-gray-100"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* After image (full width, background layer) */}
      <img
        src={afterImage}
        alt="After"
        className="w-full h-auto block"
        draggable={false}
      />
      {renderRegions("after")}

      {/* Before image (clipped by slider position) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        {/* The before image must match the full container width so it
            aligns pixel-for-pixel with the after image underneath */}
        <img
          src={beforeImage}
          alt="Before"
          className="h-full block"
          style={{
            width: containerWidth > 0 ? `${containerWidth}px` : "100vw",
            maxWidth: "none",
            objectFit: "cover",
            objectPosition: "left top",
          }}
          draggable={false}
        />
        {renderRegions("before")}
      </div>

      {/* Slider handle */}
      <div
        className="slider-handle"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="slider-grip">
          <GripVertical size={18} className="text-gray-500" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 bg-black/60 text-white px-2.5 py-1 rounded text-xs font-semibold pointer-events-none z-20">
        BEFORE
      </div>
      <div className="absolute top-3 right-3 bg-black/60 text-white px-2.5 py-1 rounded text-xs font-semibold pointer-events-none z-20">
        AFTER
      </div>
    </div>
  );
}
