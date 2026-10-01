import React from "react";

interface DifferenceViewProps {
  beforeImage: string;
  afterImage: string;
}

/**
 * Shows the actual visual differences between two images.
 * Renders a canvas that highlights where pixels changed:
 * - Red tint = area got darker (something may have been added/blocking)
 * - Green tint = area got brighter (something may have been removed)
 * - Gray base = unchanged regions (desaturated original)
 */
export function DifferenceView({
  beforeImage,
  afterImage,
}: DifferenceViewProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const beforeImg = new Image();
    const afterImg = new Image();
    let loaded = 0;

    const onBothLoaded = () => {
      loaded++;
      if (loaded < 2) return;

      const width = Math.min(beforeImg.naturalWidth, afterImg.naturalWidth);
      const height = Math.min(beforeImg.naturalHeight, afterImg.naturalHeight);

      // Scale down for performance
      const maxDim = 1000;
      const scale = Math.min(1, maxDim / width, maxDim / height);
      const cw = Math.round(width * scale);
      const ch = Math.round(height * scale);

      canvas.width = cw;
      canvas.height = ch;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw before
      const tmpBefore = document.createElement("canvas");
      tmpBefore.width = cw;
      tmpBefore.height = ch;
      const ctxB = tmpBefore.getContext("2d")!;
      ctxB.drawImage(beforeImg, 0, 0, cw, ch);
      const beforeData = ctxB.getImageData(0, 0, cw, ch);

      // Draw after
      const tmpAfter = document.createElement("canvas");
      tmpAfter.width = cw;
      tmpAfter.height = ch;
      const ctxA = tmpAfter.getContext("2d")!;
      ctxA.drawImage(afterImg, 0, 0, cw, ch);
      const afterData = ctxA.getImageData(0, 0, cw, ch);

      // Build difference visualization
      const output = ctx.createImageData(cw, ch);
      const threshold = 30;

      for (let i = 0; i < cw * ch; i++) {
        const idx = i * 4;
        const bR = beforeData.data[idx];
        const bG = beforeData.data[idx + 1];
        const bB = beforeData.data[idx + 2];
        const aR = afterData.data[idx];
        const aG = afterData.data[idx + 1];
        const aB = afterData.data[idx + 2];

        // Grayscale of before
        const grayB = 0.299 * bR + 0.587 * bG + 0.114 * bB;
        const grayA = 0.299 * aR + 0.587 * aG + 0.114 * aB;

        const diff = Math.abs(grayB - grayA);

        if (diff > threshold) {
          // Significant difference — color-code it
          const intensity = Math.min(255, diff * 2);
          if (grayB > grayA) {
            // Darker in after → something added/blocking (red)
            output.data[idx] = Math.min(255, 120 + intensity);
            output.data[idx + 1] = 40;
            output.data[idx + 2] = 40;
          } else {
            // Brighter in after → something removed (green)
            output.data[idx] = 40;
            output.data[idx + 1] = Math.min(255, 120 + intensity);
            output.data[idx + 2] = 40;
          }
        } else {
          // No significant change — show desaturated
          const gray = Math.round(grayB * 0.7 + 50);
          output.data[idx] = gray;
          output.data[idx + 1] = gray;
          output.data[idx + 2] = gray;
        }
        output.data[idx + 3] = 255;
      }

      ctx.putImageData(output, 0, 0);
      setReady(true);
    };

    beforeImg.onload = onBothLoaded;
    afterImg.onload = onBothLoaded;
    beforeImg.src = beforeImage;
    afterImg.src = afterImage;

    return () => {
      beforeImg.onload = null;
      afterImg.onload = null;
    };
  }, [beforeImage, afterImage]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="difference-canvas"
        style={{ opacity: ready ? 1 : 0, transition: "opacity 0.3s ease" }}
      />
      {!ready && (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
          Generating difference map…
        </div>
      )}
      {/* Legend */}
      {ready && (
        <div className="flex items-center gap-4 px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: "#c53030" }} />
            Darker in after
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: "#2f855a" }} />
            Brighter in after
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: "#a0a0a0" }} />
            Unchanged
          </div>
        </div>
      )}
    </div>
  );
}
