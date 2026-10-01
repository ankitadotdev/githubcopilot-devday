import type { Change } from "../../types/analysis";
import { X } from "lucide-react";

interface EvidenceViewProps {
  change: Change;
  beforeImage: string;
  afterImage: string;
  onClose: () => void;
}

export function EvidenceView({
  change,
  beforeImage,
  afterImage,
  onClose,
}: EvidenceViewProps) {
  const getCropStyle = (region: { x: number; y: number; width: number; height: number }) => {
    return {
      backgroundImage: `url(${beforeImage})`,
      backgroundPosition: `${-region.x * 100}% ${-region.y * 100}%`,
      backgroundSize: `${100 / region.width}% ${100 / region.height}%`,
      backgroundRepeat: "no-repeat",
    };
  };

  const getCropStyleAfter = (region: { x: number; y: number; width: number; height: number }) => {
    return {
      backgroundImage: `url(${afterImage})`,
      backgroundPosition: `${-region.x * 100}% ${-region.y * 100}%`,
      backgroundSize: `${100 / region.width}% ${100 / region.height}%`,
      backgroundRepeat: "no-repeat",
    };
  };

  const changeTypeEmojis: Record<string, string> = {
    added: "🟢",
    removed: "🔴",
    moved: "🟠",
    damaged: "🟡",
    modified: "🟡",
    uncertain: "⚪",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {changeTypeEmojis[change.type] || "⚪"}
            </span>
            <h2 className="text-xl font-bold text-gray-900">{change.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {change.region ? (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Evidence Region Crops
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    BEFORE
                  </p>
                  <div
                    className="w-full aspect-square bg-gray-200 rounded border border-gray-300"
                    style={getCropStyle(change.region)}
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    AFTER
                  </p>
                  <div
                    className="w-full aspect-square bg-gray-200 rounded border border-gray-300"
                    style={getCropStyleAfter(change.region)}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Observation
            </h3>
            <p className="text-sm text-gray-600 mb-4">{change.description}</p>

            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Confidence
            </h3>
            <p
              className={`text-sm font-medium ${
                change.confidenceLevel === "high"
                  ? "text-green-600"
                  : change.confidenceLevel === "medium"
                    ? "text-yellow-600"
                    : "text-orange-600"
              }`}
            >
              {change.confidenceLevel.charAt(0).toUpperCase() +
                change.confidenceLevel.slice(1)}
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
