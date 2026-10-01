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

  const changeTypeColors: Record<string, { bg: string; text: string }> = {
    added: { bg: "bg-emerald-100", text: "text-emerald-700" },
    removed: { bg: "bg-red-100", text: "text-red-700" },
    moved: { bg: "bg-amber-100", text: "text-amber-700" },
    damaged: { bg: "bg-yellow-100", text: "text-yellow-700" },
    modified: { bg: "bg-blue-100", text: "text-blue-700" },
    uncertain: { bg: "bg-gray-100", text: "text-gray-700" },
  };

  const colors = changeTypeColors[change.type] || changeTypeColors.uncertain;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-lg border subtle-border my-8">
        <div className="flex items-center justify-between p-6 border-b subtle-border">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{change.title}</h2>
            <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide">
              {change.type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition"
            aria-label="Close"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {change.region ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Evidence Region
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      Before
                    </p>
                    <div
                      className="w-full aspect-square bg-gray-100 border subtle-border rounded"
                      style={getCropStyle(change.region)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      After
                    </p>
                    <div
                      className="w-full aspect-square bg-gray-100 border subtle-border rounded"
                      style={getCropStyleAfter(change.region)}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-700">{change.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Confidence
              </h3>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  change.confidenceLevel === "high"
                    ? "bg-green-600"
                    : change.confidenceLevel === "medium"
                      ? "bg-amber-600"
                      : "bg-red-600"
                }`}></div>
                <span className="text-sm font-medium text-gray-900">
                  {change.confidenceLevel.charAt(0).toUpperCase() +
                    change.confidenceLevel.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t subtle-border">
            <button
              onClick={onClose}
              className="flex-1 button-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
