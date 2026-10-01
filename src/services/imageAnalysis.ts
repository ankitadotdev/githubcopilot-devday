import type { AnalyzeResponse } from "../types/analysis";

const DEMO_CHANGES: AnalyzeResponse = {
  summary: {
    totalChanges: 3,
  },
  changes: [
    {
      id: "change-1",
      type: "removed",
      title: "Chair",
      description:
        "A chair visible in the BEFORE image is not visible in the corresponding AFTER region.",
      confidence: 0.95,
      confidenceLevel: "high",
      region: {
        x: 0.1,
        y: 0.2,
        width: 0.25,
        height: 0.4,
      },
    },
    {
      id: "change-2",
      type: "moved",
      title: "Table",
      description:
        "The table has moved significantly to the right side of the room.",
      confidence: 0.88,
      confidenceLevel: "high",
      region: {
        x: 0.5,
        y: 0.3,
        width: 0.35,
        height: 0.35,
      },
    },
    {
      id: "change-3",
      type: "modified",
      title: "Possible new wall crack",
      description:
        "A new crack-like mark appears in this region on the wall.",
      confidence: 0.62,
      confidenceLevel: "medium",
      region: {
        x: 0.7,
        y: 0.1,
        width: 0.2,
        height: 0.15,
      },
    },
  ],
  metadata: {
    processingTime: 2500,
  },
};

export async function analyzeImages(
  _beforeImage: File,
  _afterImage: File
): Promise<AnalyzeResponse> {
  // Simulate processing time
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(DEMO_CHANGES);
    }, 2500);
  });
}
