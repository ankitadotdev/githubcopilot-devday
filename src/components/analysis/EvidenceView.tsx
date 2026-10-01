import type { Change } from "../../types/analysis";
import { X, ZoomIn } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className={`flex items-center justify-between p-8 border-b border-gray-200 ${colors.bg}`}>
          <div className="flex items-center gap-4">
            <div className={`${colors.text} text-3xl font-bold w-12 h-12 flex items-center justify-center rounded-lg ${colors.bg} border-2 border-current`}>
              {change.type.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{change.title}</h2>
              <p className={`text-sm font-semibold ${colors.text}`}>{change.type.toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-200 rounded-lg"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {change.region ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ZoomIn size={18} className="text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Evidence Region Comparison
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider">
                    Before
                  </p>
                  <div
                    className="w-full aspect-square bg-gray-300 rounded-xl border-2 border-gray-300 shadow-md hover:shadow-lg transition"
                    style={getCropStyle(change.region)}
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider">
                    After
                  </p>
                  <div
                    className="w-full aspect-square bg-gray-300 rounded-xl border-2 border-gray-300 shadow-md hover:shadow-lg transition"
                    style={getCropStyleAfter(change.region)}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="bg-white/60 p-6 rounded-xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">
              📝 Observation
            </h3>
            <p className="text-gray-700 leading-relaxed">{change.description}</p>
          </div>

          <div className="bg-white/60 p-6 rounded-xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
              🎯 Confidence Level
            </h3>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                change.confidenceLevel === "high"
                  ? "bg-emerald-500"
                  : change.confidenceLevel === "medium"
                    ? "bg-amber-500"
                    : "bg-orange-500"
              }`}></div>
              <span
                className={`text-lg font-bold ${
                  change.confidenceLevel === "high"
                    ? "text-emerald-600"
                    : change.confidenceLevel === "medium"
                      ? "text-amber-600"
                      : "text-orange-600"
                }`}
              >
                {change.confidenceLevel.charAt(0).toUpperCase() +
                  change.confidenceLevel.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-8 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 button-secondary rounded-xl font-bold transition hover:scale-105"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
