import { Check, Loader2, Circle } from "lucide-react";
import type { AnalysisStage } from "../../services/imageAnalysis";

const stages: { key: AnalysisStage; label: string }[] = [
  { key: "preparing", label: "Preparing images" },
  { key: "aligning", label: "Aligning scenes" },
  { key: "detecting", label: "Finding visual differences" },
  { key: "filtering", label: "Filtering noise" },
  { key: "identifying", label: "Identifying regions" },
  { key: "complete", label: "Preparing report" },
];

interface AnalysisProgressProps {
  isAnalyzing: boolean;
  currentStage: AnalysisStage;
}

export function AnalysisProgress({
  isAnalyzing,
  currentStage,
}: AnalysisProgressProps) {
  if (!isAnalyzing) return null;

  const currentIdx = stages.findIndex((s) => s.key === currentStage);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-xs space-y-1">
        {stages.map((stage, idx) => {
          const isDone = idx < currentIdx;
          const isActive = idx === currentIdx;

          return (
            <div
              key={stage.key}
              className={`stage-item ${
                isDone
                  ? "stage-done"
                  : isActive
                    ? "stage-active"
                    : "stage-pending"
              }`}
            >
              {isDone ? (
                <Check size={16} strokeWidth={2.5} />
              ) : isActive ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Circle size={16} strokeWidth={1.5} />
              )}
              <span>{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
