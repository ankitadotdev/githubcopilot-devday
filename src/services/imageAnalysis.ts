import type { AnalyzeResponse, Change } from "../types/analysis";

export interface ChangeRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
  intensity: number;
}

// Configuration for difference detection
const ANALYSIS_CONFIG = {
  maxAnalysisWidth: 800,
  maxAnalysisHeight: 600,
  differenceThreshold: 30,
  minRegionArea: 400,
  minRegionIntensity: 0.1,
};

/**
 * Convert File to ImageData for analysis
 */
async function fileToImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Resize image data to a target size for analysis
 */
function resizeImageData(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number
): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  ctx.putImageData(imageData, 0, 0);

  const resizeCanvas = document.createElement("canvas");
  resizeCanvas.width = targetWidth;
  resizeCanvas.height = targetHeight;
  const resizeCtx = resizeCanvas.getContext("2d");
  if (!resizeCtx) throw new Error("Failed to get resize canvas context");

  resizeCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
  return resizeCtx.getImageData(0, 0, targetWidth, targetHeight);
}

/**
 * Simple image alignment by checking color correlation
 */
function estimateAlignment(
  before: ImageData,
  after: ImageData
): { dx: number; dy: number; score: number } {
  // For MVP, we'll do basic alignment by checking global color shift
  // More sophisticated alignment would use feature detection

  const beforeAvg = getAverageColor(before);
  const afterAvg = getAverageColor(after);

  // Calculate color distance
  const score =
    1 -
    Math.sqrt(
      Math.pow(beforeAvg.r - afterAvg.r, 2) +
        Math.pow(beforeAvg.g - afterAvg.g, 2) +
        Math.pow(beforeAvg.b - afterAvg.b, 2)
    ) / 441; // 441 = sqrt(255^2 * 3)

  return { dx: 0, dy: 0, score };
}

/**
 * Get average color of image
 */
function getAverageColor(
  imageData: ImageData
): { r: number; g: number; b: number } {
  const data = imageData.data;
  let r = 0,
    g = 0,
    b = 0;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  const pixelCount = data.length / 4;
  return {
    r: Math.round(r / pixelCount),
    g: Math.round(g / pixelCount),
    b: Math.round(b / pixelCount),
  };
}

/**
 * Calculate per-pixel difference between two images
 */
function calculateDifference(
  before: ImageData,
  after: ImageData
): Uint8ClampedArray {
  const beforeData = before.data;
  const afterData = after.data;
  const difference = new Uint8ClampedArray(beforeData.length / 4);

  // Ensure same dimensions for comparison
  const minLength = Math.min(beforeData.length, afterData.length);

  for (let i = 0; i < minLength; i += 4) {
    const rDiff = Math.abs(beforeData[i] - afterData[i]);
    const gDiff = Math.abs(beforeData[i + 1] - afterData[i + 1]);
    const bDiff = Math.abs(beforeData[i + 2] - afterData[i + 2]);

    // Calculate intensity as average difference
    const intensity = (rDiff + gDiff + bDiff) / 3;
    difference[i / 4] = intensity;
  }

  return difference;
}

/**
 * Apply threshold to difference map
 */
function thresholdDifference(
  difference: Uint8ClampedArray,
  threshold: number
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(difference.length);
  for (let i = 0; i < difference.length; i++) {
    result[i] = difference[i] > threshold ? 255 : 0;
  }
  return result;
}

/**
 * Apply morphological noise reduction
 */
function morphologicalOpen(
  binary: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number = 2
): Uint8ClampedArray {
  // Erosion followed by dilation
  let result = binaryErode(binary, width, height, radius);
  result = binaryDilate(result, width, height, radius);
  return result;
}

function binaryErode(
  binary: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(binary.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      let hasZero = false;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (binary[ny * width + nx] === 0) {
              hasZero = true;
              break;
            }
          }
        }
        if (hasZero) break;
      }
      result[idx] = hasZero ? 0 : 255;
    }
  }
  return result;
}

function binaryDilate(
  binary: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(binary.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      let hasWhite = false;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (binary[ny * width + nx] === 255) {
              hasWhite = true;
              break;
            }
          }
        }
        if (hasWhite) break;
      }
      result[idx] = hasWhite ? 255 : 0;
    }
  }
  return result;
}

/**
 * Find connected components (regions) in binary image
 */
function findConnectedComponents(
  binary: Uint8ClampedArray,
  width: number,
  height: number
): ChangeRegion[] {
  const visited = new Uint8Array(binary.length);
  const components: ChangeRegion[] = [];

  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === 255 && visited[i] === 0) {
      const component = floodFill(binary, visited, i, width, height);
      if (component.area >= ANALYSIS_CONFIG.minRegionArea) {
        components.push(component);
      }
    }
  }

  return components;
}

function floodFill(
  binary: Uint8ClampedArray,
  visited: Uint8Array,
  startIdx: number,
  width: number,
  height: number
): ChangeRegion {
  const queue: number[] = [startIdx];
  visited[startIdx] = 1;

  let minX = width,
    maxX = 0,
    minY = height,
    maxY = 0;
  let pixelCount = 0;
  let totalIntensity = 0;

  while (queue.length > 0) {
    const idx = queue.shift()!;
    const y = Math.floor(idx / width);
    const x = idx % width;

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    pixelCount++;
    totalIntensity += binary[idx];

    // Check 4-connectivity
    const neighbors = [
      idx - width,
      idx + width,
      idx - 1,
      idx + 1,
    ];

    for (const nIdx of neighbors) {
      if (
        nIdx >= 0 &&
        nIdx < binary.length &&
        binary[nIdx] === 255 &&
        visited[nIdx] === 0
      ) {
        visited[nIdx] = 1;
        queue.push(nIdx);
      }
    }
  }

  const region: ChangeRegion = {
    x: minX / width,
    y: minY / height,
    width: (maxX - minX + 1) / width,
    height: (maxY - minY + 1) / height,
    area: pixelCount,
    intensity: totalIntensity / pixelCount / 255,
  };

  return region;
}

/**
 * Filter and rank meaningful regions
 */
function filterAndRankRegions(regions: ChangeRegion[]): ChangeRegion[] {
  // Filter by minimum intensity
  let filtered = regions.filter(
    (r) => r.intensity >= ANALYSIS_CONFIG.minRegionIntensity
  );

  // Sort by area (largest first)
  filtered.sort((a, b) => b.area - a.area);

  // Keep top 10 regions
  return filtered.slice(0, 10);
}

/**
 * Convert regions to change objects
 */
function regionsToChanges(regions: ChangeRegion[]): Change[] {
  return regions.map((region, idx) => ({
    id: `change-${idx + 1}`,
    type: "uncertain",
    title: `Visual Change ${idx + 1}`,
    description:
      "A significant visual difference was detected in this region.",
    confidence: Math.min(
      0.95,
      0.5 + region.intensity * 0.5
    ),
    confidenceLevel:
      region.intensity > 0.6 ? "high" : region.intensity > 0.3 ? "medium" : "low",
    region: {
      x: region.x,
      y: region.y,
      width: region.width,
      height: region.height,
    },
  }));
}

/**
 * Main image analysis function
 */
export async function analyzeImages(
  beforeFile: File,
  afterFile: File
): Promise<AnalyzeResponse> {
  try {
    const startTime = performance.now();

    // Load and prepare images
    let beforeData = await fileToImageData(beforeFile);
    let afterData = await fileToImageData(afterFile);

    // Resize to analysis size if needed
    if (
      beforeData.width > ANALYSIS_CONFIG.maxAnalysisWidth ||
      beforeData.height > ANALYSIS_CONFIG.maxAnalysisHeight
    ) {
      const scale = Math.min(
        ANALYSIS_CONFIG.maxAnalysisWidth / beforeData.width,
        ANALYSIS_CONFIG.maxAnalysisHeight / beforeData.height
      );
      beforeData = resizeImageData(
        beforeData,
        Math.round(beforeData.width * scale),
        Math.round(beforeData.height * scale)
      );
    }

    if (
      afterData.width > ANALYSIS_CONFIG.maxAnalysisWidth ||
      afterData.height > ANALYSIS_CONFIG.maxAnalysisHeight
    ) {
      const scale = Math.min(
        ANALYSIS_CONFIG.maxAnalysisWidth / afterData.width,
        ANALYSIS_CONFIG.maxAnalysisHeight / afterData.height
      );
      afterData = resizeImageData(
        afterData,
        Math.round(afterData.width * scale),
        Math.round(afterData.height * scale)
      );
    }

    // Try to align images
    const alignment = estimateAlignment(beforeData, afterData);

    // If images are very different (poorly aligned), warn user
    if (alignment.score < 0.3) {
      return {
        summary: { totalChanges: 0 },
        changes: [],
        message:
          "These images may not represent the same scene. Try taking photos from a similar position.",
        metadata: { processingTime: performance.now() - startTime },
      };
    }

    // Calculate difference
    let difference = calculateDifference(beforeData, afterData);

    // Apply threshold
    let thresholded = thresholdDifference(
      difference,
      ANALYSIS_CONFIG.differenceThreshold
    );

    // Morphological filtering to reduce noise
    thresholded = morphologicalOpen(
      thresholded,
      beforeData.width,
      beforeData.height,
      2
    );

    // Find connected components
    const regions = findConnectedComponents(
      thresholded,
      beforeData.width,
      beforeData.height
    );

    // Filter and rank
    const meaningfulRegions = filterAndRankRegions(regions);

    // Convert to changes
    const changes = regionsToChanges(meaningfulRegions);

    // If no changes found
    if (changes.length === 0) {
      return {
        summary: { totalChanges: 0 },
        changes: [],
        message: "No meaningful changes detected.",
        metadata: {
          processingTime: performance.now() - startTime,
          imageWidth: beforeData.width,
          imageHeight: beforeData.height,
        },
      };
    }

    return {
      summary: { totalChanges: changes.length },
      changes,
      metadata: {
        processingTime: performance.now() - startTime,
        imageWidth: beforeData.width,
        imageHeight: beforeData.height,
      },
    };
  } catch (error) {
    console.error("Image analysis error:", error);
    return {
      summary: { totalChanges: 0 },
      changes: [],
      message: "Error analyzing images. Please try again.",
      metadata: {},
    };
  }
}
