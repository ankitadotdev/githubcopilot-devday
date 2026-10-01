import React from "react";
import { Loader2 } from "lucide-react";

const stages = [
  "Preparing images",
  "Aligning images",
  "Detecting differences",
  "Filtering noise",
  "Identifying regions",
  "Generating report",
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
    }, 500);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  if (!isAnalyzing) return null;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-8">
        <Loader2 className="w-8 h-8 text-gray-900 animate-spin" />
      </div>

      <p className="text-gray-700 text-sm font-medium mb-6">
        {stages[currentStage]}
      </p>

      <div className="w-full max-w-xs bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-gray-900 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
