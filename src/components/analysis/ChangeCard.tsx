import type { Change } from "../../types/analysis";
import { ChevronRight } from "lucide-react";

const changeTypeEmojis: Record<string, string> = {
  added: "🟢",
  removed: "🔴",
  moved: "🟠",
  damaged: "🟡",
  modified: "🟡",
  uncertain: "⚪",
};

const changeTypeLabels: Record<string, string> = {
  added: "ADDED",
  removed: "REMOVED",
  moved: "MOVED",
  damaged: "DAMAGED",
  modified: "MODIFIED",
  uncertain: "UNCERTAIN",
};

interface ChangeCardProps {
  change: Change;
  isSelected: boolean;
  onClick: () => void;
  onViewEvidence: () => void;
  disabled?: boolean;
}

export function ChangeCard({
  change,
  isSelected,
  onClick,
  onViewEvidence,
  disabled = false,
}: ChangeCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-lg border transition cursor-pointer ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">
              {changeTypeEmojis[change.type] || "⚪"}
            </span>
            <span className="text-xs font-bold text-gray-500">
              {changeTypeLabels[change.type] || "UNKNOWN"}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-2">{change.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{change.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Confidence:{" "}
              <span
                className={
                  change.confidenceLevel === "high"
                    ? "text-green-600"
                    : change.confidenceLevel === "medium"
                      ? "text-yellow-600"
                      : "text-orange-600"
                }
              >
                {change.confidenceLevel.charAt(0).toUpperCase() +
                  change.confidenceLevel.slice(1)}
              </span>
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewEvidence();
          }}
          disabled={disabled}
          className="mt-2 px-3 py-1 text-xs font-medium bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded transition whitespace-nowrap flex items-center gap-1"
        >
          View Evidence
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
