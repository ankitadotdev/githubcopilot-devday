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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b subtle-border bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 md:py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            WHAT CHANGED?
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Compare images and see what actually changed
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 md:py-12">
        {viewMode === "upload" ? (
          // Upload View
          <div className="space-y-8">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-6">
                Upload two images to compare
              </p>
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
            </div>

            {isAnalyzing && <AnalysisProgress isAnalyzing={isAnalyzing} />}

            <div className="flex justify-center pt-4">
              <button
                onClick={handleCompare}
                disabled={!canCompare}
                className="button-primary"
              >
                {beforeFile && afterFile
                  ? "Analyze Images"
                  : "Add both images to continue"}
              </button>
            </div>
          </div>
        ) : (
          // Comparison View
          <div className="space-y-8">
            {/* Summary */}
            {analysisResult && (
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/30 card-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {analysisResult.summary.totalChanges > 0
                        ? `✨ ${analysisResult.summary.totalChanges} meaningful change${
                            analysisResult.summary.totalChanges !== 1 ? "s" : ""
                          } detected`
                        : "✓ No meaningful changes detected."}
                    </h2>
                    {analysisResult.message && (
                      <p className="text-gray-600 mt-3 text-lg">{analysisResult.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Comparison Modes */}
            {beforePreview && afterPreview && (
              <>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button
                    onClick={() => setComparisonMode("side-by-side")}
                    className={`px-6 py-3 rounded-xl font-bold transition transform ${
                      comparisonMode === "side-by-side"
                        ? "button-primary shadow-lg scale-105"
                        : "button-secondary hover:bg-gray-300"
                    }`}
                  >
                    👀 Side-by-side
                  </button>
                  <button
                    onClick={() => setComparisonMode("slider")}
                    className={`px-6 py-3 rounded-xl font-bold transition transform ${
                      comparisonMode === "slider"
                        ? "button-primary shadow-lg scale-105"
                        : "button-secondary hover:bg-gray-300"
                    }`}
                  >
                    🎚️ Slider
                  </button>
                </div>

                <div className="bg-white/90 border border-white/30 rounded-2xl overflow-hidden card-shadow">
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
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    📋 Detected Changes
                  </h3>
                  <p className="text-gray-600 mt-1">Click any change to view details</p>
                </div>
                 <div className="grid gap-4">
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
            <div className="flex justify-center gap-4 pt-8">
              <button
                onClick={handleReset}
                className="px-8 py-3 button-secondary rounded-xl font-bold transition hover:scale-105"
              >
                🔄 New Comparison
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
