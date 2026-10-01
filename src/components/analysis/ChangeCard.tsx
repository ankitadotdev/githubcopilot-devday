import type { Change } from "../../types/analysis";
import { ChevronRight } from "lucide-react";

const changeTypeColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  added: {
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
    badge: "bg-gradient-to-r from-emerald-500 to-green-600",
  },
  removed: {
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-700",
    badge: "bg-gradient-to-r from-red-500 to-rose-600",
  },
  moved: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    badge: "bg-gradient-to-r from-amber-500 to-orange-600",
  },
  damaged: {
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    text: "text-yellow-700",
    badge: "bg-gradient-to-r from-yellow-500 to-amber-600",
  },
  modified: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-700",
    badge: "bg-gradient-to-r from-blue-500 to-cyan-600",
  },
  uncertain: {
    bg: "bg-gray-50",
    border: "border-gray-300",
    text: "text-gray-700",
    badge: "bg-gradient-to-r from-gray-500 to-slate-600",
  },
};

const changeTypeLabels: Record<string, string> = {
  added: "Added",
  removed: "Removed",
  moved: "Moved",
  damaged: "Damaged",
  modified: "Modified",
  uncertain: "Uncertain",
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
  const formattedIndex = String(index + 1).padStart(2, "0");
  const colors = changeTypeColors[change.type] || changeTypeColors.uncertain;

  const confidenceColor = {
    high: "text-emerald-600 font-bold",
    medium: "text-amber-600 font-semibold",
    low: "text-orange-600 font-semibold",
  }[change.confidenceLevel] || "text-gray-600";

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl border-2 transition cursor-pointer card-shadow ${
        isSelected ? `${colors.bg} ${colors.border} ring-2 ring-offset-2 ring-${colors.text.split('-')[1]}-500` : `bg-white ${colors.border} hover:shadow-lg`
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`${colors.badge} text-white font-mono text-sm font-bold px-3 py-1 rounded-full shadow-md`}>
              #{formattedIndex}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
              {changeTypeLabels[change.type] || "Unknown"}
            </span>
          </div>

          <h3 className="font-bold text-lg text-gray-900 mb-2">{change.title}</h3>

          <div className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${colors.badge}`}></span>
            <span className={`text-sm ${confidenceColor}`}>
              {change.confidenceLevel.charAt(0).toUpperCase() + change.confidenceLevel.slice(1)} confidence
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewEvidence();
          }}
          disabled={disabled}
          className="mt-1 button-primary text-sm flex items-center gap-1 shrink-0"
        >
          View
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
