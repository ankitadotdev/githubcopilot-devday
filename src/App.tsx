import { useState, useCallback } from "react";
import { RotateCcw, ArrowRight } from "lucide-react";
import { ImagePreview } from "./components/upload/ImagePreview";
import { AnalysisProgress } from "./components/analysis/AnalysisProgress";
import { ChangeCard } from "./components/analysis/ChangeCard";
import { EvidenceView } from "./components/analysis/EvidenceView";
import { SideBySide } from "./components/comparison/SideBySide";
import { ComparisonSlider } from "./components/comparison/ComparisonSlider";
import { DifferenceView } from "./components/comparison/DifferenceView";
import { analyzeImages } from "./services/imageAnalysis";
import type { AnalysisStage } from "./services/imageAnalysis";
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
  const [comparisonMode, setComparisonMode] =
    useState<ComparisonMode>("slider");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] =
    useState<AnalysisStage>("preparing");
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(
    null
  );

  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(null);
  const [showEvidenceView, setShowEvidenceView] = useState(false);

  const handleBeforeFileChange = useCallback(
    (file: File | null) => {
      if (beforePreview) revokeObjectURL(beforePreview);
      setBeforeFile(file);
      setBeforePreview(file ? createObjectURL(file) : null);
    },
    [beforePreview]
  );

  const handleAfterFileChange = useCallback(
    (file: File | null) => {
      if (afterPreview) revokeObjectURL(afterPreview);
      setAfterFile(file);
      setAfterPreview(file ? createObjectURL(file) : null);
    },
    [afterPreview]
  );

  const handleCompare = async () => {
    if (!beforeFile || !afterFile) return;

    setIsAnalyzing(true);
    setAnalysisStage("preparing");

    try {
      const result = await analyzeImages(beforeFile, afterFile, (stage) => {
        setAnalysisStage(stage);
      });
      setAnalysisResult(result);
      setViewMode("comparison");
      setSelectedChangeId(null);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Error analyzing images. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    if (beforePreview) revokeObjectURL(beforePreview);
    if (afterPreview) revokeObjectURL(afterPreview);
    setBeforeFile(null);
    setAfterFile(null);
    setBeforePreview(null);
    setAfterPreview(null);
    setAnalysisResult(null);
    setViewMode("upload");
    setSelectedChangeId(null);
    setShowEvidenceView(false);
    setComparisonMode("slider");
  };

  const selectedChange = analysisResult?.changes.find(
    (c) => c.id === selectedChangeId
  );
  const selectedChangeIndex = analysisResult?.changes.findIndex(
    (c) => c.id === selectedChangeId
  );

  const canCompare = beforeFile && afterFile && !isAnalyzing;

  // Build highlight regions from analysis results
  const highlightRegions =
    analysisResult?.changes.map((change, idx) => ({
      id: change.id,
      region: change.region || { x: 0, y: 0, width: 1, height: 1 },
      type: change.type,
      index: idx,
      onClick: () => setSelectedChangeId(change.id),
    })) || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      {/* ──── Header ──── */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-5 py-5 md:py-7 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              WHAT CHANGED?
            </h1>
            <p className="text-gray-500 mt-0.5 text-sm">
              See what actually changed between two moments.
            </p>
          </div>
          {viewMode === "comparison" && (
            <button
              onClick={handleReset}
              className="button-secondary flex items-center gap-2 text-sm"
            >
              <RotateCcw size={15} />
              New Comparison
            </button>
          )}
        </div>
      </header>

      {/* ──── Main ──── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8 md:py-12">
        {viewMode === "upload" ? (
          /* ──── Upload View ──── */
          <div className="space-y-10">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImagePreview
                  label="Before"
                  file={beforeFile}
                  preview={beforePreview}
                  onFileChange={handleBeforeFileChange}
                  onDrop={handleBeforeFileChange}
                  disabled={isAnalyzing}
                />
                <ImagePreview
                  label="After"
                  file={afterFile}
                  preview={afterPreview}
                  onFileChange={handleAfterFileChange}
                  onDrop={handleAfterFileChange}
                  disabled={isAnalyzing}
                />
              </div>
            </div>

            {isAnalyzing && (
              <AnalysisProgress
                isAnalyzing={isAnalyzing}
                currentStage={analysisStage}
              />
            )}

            <div className="flex justify-center">
              <button
                onClick={handleCompare}
                disabled={!canCompare}
                className="button-primary flex items-center gap-2"
              >
                {isAnalyzing
                  ? "Analyzing…"
                  : beforeFile && afterFile
                    ? (
                      <>
                        Compare Images
                        <ArrowRight size={16} />
                      </>
                    )
                    : "Add both images to continue"}
              </button>
            </div>
          </div>
        ) : (
          /* ──── Comparison View ──── */
          <div className="space-y-8">
            {/* Summary */}
            {analysisResult && (
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                  {analysisResult.summary.totalChanges > 0
                    ? `${analysisResult.summary.totalChanges} meaningful change${
                        analysisResult.summary.totalChanges !== 1 ? "s" : ""
                      } detected`
                    : "No meaningful changes detected"}
                </h2>
                {analysisResult.message && (
                  <p className="text-gray-500 mt-2 text-sm">
                    {analysisResult.message}
                  </p>
                )}
                {analysisResult.metadata?.processingTime && (
                  <p className="text-gray-400 mt-1 text-xs">
                    Processed in{" "}
                    {(analysisResult.metadata.processingTime / 1000).toFixed(1)}s
                  </p>
                )}
              </div>
            )}

            {/* Comparison Modes */}
            {beforePreview && afterPreview && (
              <>
                {/* Mode toggle */}
                <div className="flex justify-center">
                  <div className="mode-toggle">
                    {(
                      [
                        { key: "slider", label: "Slider" },
                        { key: "side-by-side", label: "Side by Side" },
                        { key: "difference", label: "Difference" },
                      ] as const
                    ).map((mode) => (
                      <button
                        key={mode.key}
                        onClick={() => setComparisonMode(mode.key)}
                        className={`mode-toggle-btn ${
                          comparisonMode === mode.key ? "active" : ""
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comparison area */}
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-white card-shadow">
                  {comparisonMode === "slider" ? (
                    <ComparisonSlider
                      beforeImage={beforePreview}
                      afterImage={afterPreview}
                      highlightRegions={highlightRegions}
                      selectedRegionId={selectedChangeId}
                    />
                  ) : comparisonMode === "side-by-side" ? (
                    <SideBySide
                      beforeImage={beforePreview}
                      afterImage={afterPreview}
                      highlightRegions={highlightRegions}
                      selectedRegionId={selectedChangeId}
                    />
                  ) : (
                    <DifferenceView
                      beforeImage={beforePreview}
                      afterImage={afterPreview}
                    />
                  )}
                </div>
              </>
            )}

            {/* Changes List */}
            {analysisResult && analysisResult.changes.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Detected Changes
                  </h3>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Click any change to highlight the region. Click "Evidence" to
                    see before/after crops.
                  </p>
                </div>
                <div className="grid gap-2">
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
          </div>
        )}
      </main>

      {/* ──── Evidence Modal ──── */}
      {showEvidenceView &&
        selectedChange &&
        selectedChangeIndex !== undefined &&
        selectedChangeIndex >= 0 &&
        beforePreview &&
        afterPreview && (
          <EvidenceView
            change={selectedChange}
            changeIndex={selectedChangeIndex}
            beforeImage={beforePreview}
            afterImage={afterPreview}
            onClose={() => setShowEvidenceView(false)}
            onFocusRegion={() => {
              setComparisonMode("slider");
            }}
          />
        )}
    </div>
  );
}

export default App;
