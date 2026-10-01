import React from "react";
import type { Change } from "../../types/analysis";
import { X, Focus } from "lucide-react";

interface EvidenceViewProps {
  change: Change;
  changeIndex: number;
  beforeImage: string;
  afterImage: string;
  onClose: () => void;
  onFocusRegion?: () => void;
}

const changeTypeLabels: Record<string, string> = {
  added: "ADDED",
  removed: "REMOVED",
  moved: "MOVED",
  damaged: "DAMAGED",
  modified: "MODIFIED",
  uncertain: "CHANGE DETECTED",
};

const changeTypeColors: Record<string, { badge: string; text: string }> = {
  added: { badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", text: "text-emerald-700" },
  removed: { badge: "bg-red-50 text-red-700 border border-red-200", text: "text-red-700" },
  moved: { badge: "bg-amber-50 text-amber-700 border border-amber-200", text: "text-amber-700" },
  damaged: { badge: "bg-yellow-50 text-yellow-700 border border-yellow-200", text: "text-yellow-700" },
  modified: { badge: "bg-blue-50 text-blue-700 border border-blue-200", text: "text-blue-700" },
  uncertain: { badge: "bg-gray-50 text-gray-700 border border-gray-200", text: "text-gray-600" },
};

/**
 * Render a crop of the image by drawing onto a canvas.
 * Uses a canvas element to extract exactly the region in question
 * at high quality.
 */
function EvidenceCrop({
  imageSrc,
  region,
  label,
}: {
  imageSrc: string;
  region: { x: number; y: number; width: number; height: number };
  label: string;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.onload = () => {
      // Actual pixel coordinates
      const sx = region.x * img.naturalWidth;
      const sy = region.y * img.naturalHeight;
      const sw = region.width * img.naturalWidth;
      const sh = region.height * img.naturalHeight;

      // Canvas display size – keep aspect ratio, max 300px wide
      const maxW = 300;
      const scale = Math.min(maxW / sw, maxW / sh, 2); // don't upscale more than 2×
      const cw = Math.round(sw * scale);
      const ch = Math.round(sh * scale);

      canvas.width = cw;
      canvas.height = ch;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    };
    img.src = imageSrc;
  }, [imageSrc, region]);

  return (
    <div className="flex flex-col">
      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
        {label}
      </p>
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-lg border border-gray-200 bg-gray-50"
        style={{ maxHeight: "240px", objectFit: "contain" }}
      />
    </div>
  );
}

export function EvidenceView({
  change,
  changeIndex,
  beforeImage,
  afterImage,
  onClose,
  onFocusRegion,
}: EvidenceViewProps) {
  const colors = changeTypeColors[change.type] || changeTypeColors.uncertain;

  // Close on Escape key
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="evidence-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="evidence-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-bold text-gray-400">
              #{String(changeIndex + 1).padStart(2, "0")}
            </span>
            <span
              className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-md ${colors.badge}`}
            >
              {changeTypeLabels[change.type] || "UNCERTAIN"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Title */}
          <h2 className="text-lg font-bold text-gray-900">{change.title}</h2>

          {/* Evidence crops */}
          {change.region && (
            <div className="grid grid-cols-2 gap-4">
              <EvidenceCrop
                imageSrc={beforeImage}
                region={change.region}
                label="Before"
              />
              <EvidenceCrop
                imageSrc={afterImage}
                region={change.region}
                label="After"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
              What changed
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {change.description}
            </p>
          </div>

          {/* Confidence */}
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Confidence
            </h3>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  change.confidenceLevel === "high"
                    ? "bg-emerald-500"
                    : change.confidenceLevel === "medium"
                      ? "bg-amber-500"
                      : "bg-gray-400"
                }`}
              />
              <span className="text-sm font-medium text-gray-700 capitalize">
                {change.confidenceLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-gray-100">
          {onFocusRegion && change.region && (
            <button
              onClick={() => {
                onFocusRegion();
                onClose();
              }}
              className="flex-1 button-primary flex items-center justify-center gap-2"
            >
              <Focus size={16} />
              Focus on region
            </button>
          )}
          <button onClick={onClose} className="flex-1 button-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
