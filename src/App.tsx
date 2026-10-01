import { useState } from "react";
import { ImagePreview } from "./components/upload/ImagePreview";
import { AnalysisProgress } from "./components/analysis/AnalysisProgress";
import { ChangeCard } from "./components/analysis/ChangeCard";
import { EvidenceView } from "./components/analysis/EvidenceView";
import { SideBySide } from "./components/comparison/SideBySide";
import { ComparisonSlider } from "./components/comparison/ComparisonSlider";
import { analyzeImages } from "./services/imageAnalysis";
import { createObjectURL, revokeObjectURL } from "./utils/image";
import type { AnalyzeResponse } from "./types/analysis";

type ViewMode = "upload" | "comparison";
type ComparisonMode = "side-by-side" | "slider" | "difference";

function App() {
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("upload");
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("slider");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(
    null
  );

  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(null);
  const [showEvidenceView, setShowEvidenceView] = useState(false);

  const handleBeforeFileChange = (file: File | null) => {
    if (beforePreview) {
      revokeObjectURL(beforePreview);
    }
    setBeforeFile(file);
    if (file) {
      setBeforePreview(createObjectURL(file));
    } else {
      setBeforePreview(null);
    }
  };

  const handleAfterFileChange = (file: File | null) => {
    if (afterPreview) {
      revokeObjectURL(afterPreview);
    }
    setAfterFile(file);
    if (file) {
      setAfterPreview(createObjectURL(file));
    } else {
      setAfterPreview(null);
    }
  };

  const handleCompare = async () => {
    if (!beforeFile || !afterFile) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeImages(beforeFile, afterFile);
      setAnalysisResult(result);
      setViewMode("comparison");
      setSelectedChangeId(null);
    } catch (error) {
      alert("Error analyzing images. Please try again.");
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    revokeObjectURL(beforePreview || "");
    revokeObjectURL(afterPreview || "");
    setBeforeFile(null);
    setAfterFile(null);
    setBeforePreview(null);
    setAfterPreview(null);
    setAnalysisResult(null);
    setViewMode("upload");
    setSelectedChangeId(null);
    setShowEvidenceView(false);
  };

  const selectedChange = analysisResult?.changes.find(
    (c) => c.id === selectedChangeId
  );

  const canCompare = beforeFile && afterFile && !isAnalyzing;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            WHAT CHANGED?
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Don't compare pictures. Understand what changed.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {viewMode === "upload" ? (
          // Upload View
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ImagePreview
                label="BEFORE"
                file={beforeFile}
                preview={beforePreview}
                onFileChange={handleBeforeFileChange}
                onDrop={handleBeforeFileChange}
                disabled={isAnalyzing}
              />
              <ImagePreview
                label="AFTER"
                file={afterFile}
                preview={afterPreview}
                onFileChange={handleAfterFileChange}
                onDrop={handleAfterFileChange}
                disabled={isAnalyzing}
              />
            </div>

            {isAnalyzing && <AnalysisProgress isAnalyzing={isAnalyzing} />}

            <div className="flex justify-center">
              <button
                onClick={handleCompare}
                disabled={!canCompare}
                className={`px-8 py-3 font-semibold rounded-lg transition text-lg ${
                  canCompare
                    ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {beforeFile && afterFile
                  ? "COMPARE IMAGES"
                  : "Add both images"}
              </button>
            </div>
          </div>
        ) : (
          // Comparison View
          <div className="space-y-8">
            {/* Summary */}
            {analysisResult && (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {analysisResult.summary.totalChanges > 0
                    ? `${analysisResult.summary.totalChanges} meaningful change${
                        analysisResult.summary.totalChanges !== 1 ? "s" : ""
                      } detected`
                    : "No meaningful changes detected."}
                </h2>
                {analysisResult.message && (
                  <p className="text-gray-600 mt-2">{analysisResult.message}</p>
                )}
              </div>
            )}

            {/* Comparison Modes */}
            {beforePreview && afterPreview && (
              <>
                <div className="flex gap-2 justify-center flex-wrap">
                  <button
                    onClick={() => setComparisonMode("side-by-side")}
                    className={`px-4 py-2 rounded font-medium transition ${
                      comparisonMode === "side-by-side"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Side-by-side
                  </button>
                  <button
                    onClick={() => setComparisonMode("slider")}
                    className={`px-4 py-2 rounded font-medium transition ${
                      comparisonMode === "slider"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Slider
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {comparisonMode === "side-by-side" ? (
                    <SideBySide
                      beforeImage={beforePreview}
                      afterImage={afterPreview}
                      highlightRegions={
                        analysisResult?.changes.map((change) => ({
                          id: change.id,
                          region: change.region || {
                            x: 0,
                            y: 0,
                            width: 1,
                            height: 1,
                          },
                          type: change.type,
                          onClick: () => setSelectedChangeId(change.id),
                        })) || []
                      }
                    />
                  ) : (
                    <ComparisonSlider
                      beforeImage={beforePreview}
                      afterImage={afterPreview}
                      highlightRegions={
                        analysisResult?.changes.map((change) => ({
                          id: change.id,
                          region: change.region || {
                            x: 0,
                            y: 0,
                            width: 1,
                            height: 1,
                          },
                          type: change.type,
                        })) || []
                      }
                    />
                  )}
                </div>
              </>
            )}

            {/* Changes List */}
            {analysisResult && analysisResult.changes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detected Changes
                </h3>
                 <div className="grid gap-3">
                  {analysisResult.changes.map((change, index) => (
                    <ChangeCard
                      key={change.id}
                      change={change}
                      index={index}
                      isSelected={selectedChangeId === change.id}
                      onClick={() => setSelectedChangeId(change.id)}
                      onViewEvidence={() => {
                        setSelectedChangeId(change.id);
                        setShowEvidenceView(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded transition"
              >
                New Comparison
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Evidence View Modal */}
      {showEvidenceView && selectedChange && beforePreview && afterPreview && (
        <EvidenceView
          change={selectedChange}
          beforeImage={beforePreview}
          afterImage={afterPreview}
          onClose={() => setShowEvidenceView(false)}
        />
      )}
    </div>
  );
}

export default App;
