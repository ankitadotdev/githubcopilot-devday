import React from "react";

const stages = [
  "Preparing images",
  "Aligning scenes",
  "Finding visual differences",
  "Filtering noise",
  "Identifying changed regions",
  "Preparing report",
];

interface AnalysisProgressProps {
  isAnalyzing: boolean;
}

export function AnalysisProgress({ isAnalyzing }: AnalysisProgressProps) {
  const [currentStage, setCurrentStage] = React.useState(0);

  React.useEffect(() => {
    if (!isAnalyzing) return;

    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % stages.length);
    }, 400);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  if (!isAnalyzing) return null;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="space-y-4 w-full max-w-xs">
        {stages.map((stage, index) => (
          <div key={stage} className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full transition-all ${
                index < currentStage
                  ? "bg-green-500 w-6"
                  : index === currentStage
                    ? "bg-blue-500 animate-pulse w-6"
                    : "bg-gray-300"
              }`}
            ></div>
            <span
              className={`text-sm ${
                index <= currentStage
                  ? "text-gray-900 font-medium"
                  : "text-gray-400"
              }`}
            >
              {stage}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
