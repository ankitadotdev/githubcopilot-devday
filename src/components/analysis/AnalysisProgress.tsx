import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold gradient-heading mb-2">Analyzing Images</h3>
        <p className="text-gray-600">Detecting differences with computer vision...</p>
      </div>

      <div className="space-y-3 w-full max-w-md">
        {stages.map((stage, index) => (
          <div key={stage} className="flex items-center gap-4">
            <div className="relative w-8 h-8">
              {index < currentStage ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
              ) : index === currentStage ? (
                <>
                  <Circle className="w-8 h-8 text-blue-500 animate-spin" strokeWidth={1.5} />
                </>
              ) : (
                <Circle className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
              )}
            </div>
            <span
              className={`text-sm font-medium transition-all ${
                index <= currentStage
                  ? "text-gray-900"
                  : "text-gray-400"
              }`}
            >
              {stage}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 w-full max-w-md bg-gray-200 rounded-full h-1">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all duration-300"
          style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
