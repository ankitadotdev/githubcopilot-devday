export type ChangeType = "added" | "removed" | "moved" | "damaged" | "modified" | "uncertain";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Change {
  id: string;
  type: ChangeType;
  title: string;
  description: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  region?: Region;
  beforeEvidence?: string;
  afterEvidence?: string;
}

export interface AnalyzeResponse {
  summary: {
    totalChanges: number;
  };
  changes: Change[];
  metadata?: {
    processingTime?: number;
    imageWidth?: number;
    imageHeight?: number;
  };
  message?: string;
}
