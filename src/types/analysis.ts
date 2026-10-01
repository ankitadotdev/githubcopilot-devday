export type ChangeType =
  | "added"
  | "removed"
  | "moved"
  | "damaged"
  | "modified"
  | "uncertain";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface Region {
  x: number;      // 0..1 normalized left
  y: number;      // 0..1 normalized top
  width: number;  // 0..1 normalized width
  height: number; // 0..1 normalized height
}

export interface Change {
  id: string;
  type: ChangeType;
  title: string;
  description: string;
  confidence: number;       // 0..1
  confidenceLevel: ConfidenceLevel;
  region?: Region;
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
