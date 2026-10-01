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

const semanticBgColors: Record<string, string> = {
  added: "semantic-bg-added",
  removed: "semantic-bg-removed",
  moved: "semantic-bg-moved",
  modified: "semantic-bg-modified",
  uncertain: "semantic-bg-uncertain",
};

const semanticTextColors: Record<string, string> = {
  removed: "semantic-color-removed",
  added: "semantic-color-added",
  moved: "semantic-color-moved",
  modified: "semantic-color-modified",
  uncertain: "semantic-color-uncertain",
};

interface ChangeCardProps {
  change: Change;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onViewEvidence: () => void;
}

export function ChangeCard({
  change,
  index,
  isSelected,
  onClick,
  onViewEvidence,
}: ChangeCardProps) {
  const bgClass = semanticBgColors[change.type] || "bg-gray-50";
  const textClass = semanticTextColors[change.type] || "text-gray-600";

  return (
    <div
      onClick={onClick}
      className={`px-4 py-3.5 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? `${bgClass} border-current`
          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`font-mono text-sm font-bold ${textClass} shrink-0`}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className={`text-xs font-bold uppercase tracking-wide ${textClass} shrink-0`}
          >
            {changeTypeLabels[change.type] || "Unknown"}
          </span>
          <span className="text-sm font-medium text-gray-900 truncate">
            {change.title}
          </span>
          <span className="text-xs text-gray-400 shrink-0 capitalize">
            {change.confidenceLevel}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewEvidence();
          }}
          className="button-sm shrink-0 flex items-center gap-1"
        >
          Evidence
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
