import type { Change } from "../../types/analysis";
import { ChevronRight } from "lucide-react";

const changeTypeLabels: Record<string, string> = {
  added: "Added",
  removed: "Removed",
  moved: "Moved",
  damaged: "Damaged",
  modified: "Modified",
  uncertain: "Uncertain",
};

const semanticColors: Record<string, string> = {
  added: "semantic-bg-added",
  removed: "semantic-bg-removed",
  moved: "semantic-bg-moved",
  modified: "semantic-bg-modified",
};

interface ChangeCardProps {
  change: Change;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onViewEvidence: () => void;
  disabled?: boolean;
}

export function ChangeCard({
  change,
  index,
  isSelected,
  onClick,
  onViewEvidence,
  disabled = false,
}: ChangeCardProps) {
  const bgClass = semanticColors[change.type] || "bg-gray-50";
  const textClass = 
    change.type === "removed" ? "semantic-color-removed" :
    change.type === "added" ? "semantic-color-added" :
    change.type === "moved" ? "semantic-color-moved" :
    change.type === "modified" ? "semantic-color-modified" :
    "text-gray-600";

  const confidenceText =
    change.confidenceLevel === "high" ? "High" :
    change.confidenceLevel === "medium" ? "Medium" :
    "Low";

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border subtle-border transition-all cursor-pointer ${
        isSelected
          ? `${bgClass} shadow-md`
          : "bg-white hover:bg-gray-50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`font-mono text-sm font-bold ${textClass}`}>
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className={`text-xs font-semibold uppercase tracking-wide ${textClass}`}>
              {changeTypeLabels[change.type] || "Unknown"}
            </div>
            <div className="text-xs font-medium text-gray-500">
              {confidenceText}
            </div>
          </div>
          <h3 className="font-semibold text-gray-900">{change.title}</h3>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewEvidence();
          }}
          disabled={disabled}
          className="button-sm shrink-0 flex items-center gap-1"
        >
          View
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
