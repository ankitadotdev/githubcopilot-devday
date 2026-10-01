import type { AnalyzeResponse, Change, Region } from "../types/analysis";

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
  differenceThreshold: 32,
  minRegionArea: 500,
  minRegionIntensity: 0.12,
  maxRegions: 10,
  morphRadius: 3,
  // Gaussian blur radius for noise reduction
  blurRadius: 2,
};

/**
 * Convert a File to ImageData at a normalized analysis size.
 * Returns both the ImageData and the original image dimensions.
 */
async function fileToImageData(
  file: File,
  targetWidth: number,
  targetHeight: number
): Promise<{ data: ImageData; originalWidth: number; originalHeight: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);

      const originalWidth = img.width;
      const originalHeight = img.height;

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      resolve({
        data: ctx.getImageData(0, 0, targetWidth, targetHeight),
        originalWidth,
        originalHeight,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

/**
 * Calculate the analysis dimensions that fit within config limits
 * while preserving aspect ratio. Both images will be resized to
 * the same dimensions.
 */
function calcAnalysisSize(
  w1: number,
  h1: number,
  w2: number,
  h2: number
): { width: number; height: number } {
  // Use the average aspect ratio
  const avgW = (w1 + w2) / 2;
  const avgH = (h1 + h2) / 2;
  const scale = Math.min(
    1,
    ANALYSIS_CONFIG.maxAnalysisWidth / avgW,
    ANALYSIS_CONFIG.maxAnalysisHeight / avgH
  );
  return {
    width: Math.round(avgW * scale),
    height: Math.round(avgH * scale),
  };
}

/**
 * Convert RGB to grayscale using luminance weights
 */
function toGrayscale(imageData: ImageData): Uint8ClampedArray {
  const { data, width, height } = imageData;
  const gray = new Uint8ClampedArray(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    // Rec. 601 luma
    gray[i] = Math.round(
      0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
    );
  }
  return gray;
}

/**
 * Simple box blur for noise reduction
 */
function boxBlur(
  gray: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(gray.length);

  // Horizontal pass
  const temp = new Uint8ClampedArray(gray.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        if (nx >= 0 && nx < width) {
          sum += gray[y * width + nx];
          count++;
        }
      }
      temp[y * width + x] = Math.round(sum / count);
    }
  }

  // Vertical pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < height) {
          sum += temp[ny * width + x];
          count++;
        }
      }
      result[y * width + x] = Math.round(sum / count);
    }
  }

  return result;
}

/**
 * Compute similarity score between two grayscale images using
 * normalized cross-correlation on a downsampled grid.
 * Returns 0..1 (1 = identical).
 */
function computeSimilarity(
  grayA: Uint8ClampedArray,
  grayB: Uint8ClampedArray,
  width: number,
  height: number
): number {
  // Sample every 4th pixel for speed
  const step = 4;
  let sumAB = 0,
    sumA2 = 0,
    sumB2 = 0;
  let meanA = 0,
    meanB = 0,
    count = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = y * width + x;
      meanA += grayA[idx];
      meanB += grayB[idx];
      count++;
    }
  }
  meanA /= count;
  meanB /= count;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = y * width + x;
      const a = grayA[idx] - meanA;
      const b = grayB[idx] - meanB;
      sumAB += a * b;
      sumA2 += a * a;
      sumB2 += b * b;
    }
  }

  const denom = Math.sqrt(sumA2 * sumB2);
  if (denom === 0) return 1; // both are flat/identical
  return Math.max(0, sumAB / denom);
}

/**
 * Calculate per-pixel absolute difference between two grayscale images
 */
function calculateGrayDifference(
  grayA: Uint8ClampedArray,
  grayB: Uint8ClampedArray
): Uint8ClampedArray {
  const diff = new Uint8ClampedArray(grayA.length);
  for (let i = 0; i < grayA.length; i++) {
    diff[i] = Math.abs(grayA[i] - grayB[i]);
  }
  return diff;
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
 * Morphological opening (erosion then dilation) to remove small noise
 */
function morphologicalOpen(
  binary: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray {
  let result = binaryErode(binary, width, height, radius);
  result = binaryDilate(result, width, height, radius + 1); // slightly larger dilation to reconnect
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
      let allWhite = true;
      outer: for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (binary[ny * width + nx] === 0) {
              allWhite = false;
              break outer;
            }
          }
        }
      }
      result[idx] = allWhite ? 255 : 0;
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
      outer: for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (binary[ny * width + nx] === 255) {
              hasWhite = true;
              break outer;
            }
          }
        }
      }
      result[idx] = hasWhite ? 255 : 0;
    }
  }
  return result;
}

/**
 * Find connected components (regions) in binary image using flood fill.
 * Returns bounding boxes in normalized (0..1) coordinates.
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

  while (queue.length > 0) {
    const idx = queue.shift()!;
    const y = Math.floor(idx / width);
    const x = idx % width;

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    pixelCount++;

    // 4-connectivity neighbors
    const neighbors = [idx - width, idx + width, idx - 1, idx + 1];

    for (const nIdx of neighbors) {
      if (nIdx < 0 || nIdx >= binary.length) continue;
      // Prevent wrapping across rows
      const nx = nIdx % width;
      const ox = idx % width;
      if (Math.abs(nx - ox) > 1 && nIdx !== idx - width && nIdx !== idx + width)
        continue;
      if (binary[nIdx] === 255 && visited[nIdx] === 0) {
        visited[nIdx] = 1;
        queue.push(nIdx);
      }
    }
  }

  // Compute intensity as the ratio of changed pixels to bounding-box area
  const bboxW = maxX - minX + 1;
  const bboxH = maxY - minY + 1;
  const bboxArea = bboxW * bboxH;

  return {
    x: minX / width,
    y: minY / height,
    width: bboxW / width,
    height: bboxH / height,
    area: pixelCount,
    intensity: bboxArea > 0 ? pixelCount / bboxArea : 0,
  };
}

/**
 * Merge overlapping/nearby regions
 */
function mergeOverlappingRegions(regions: ChangeRegion[]): ChangeRegion[] {
  if (regions.length <= 1) return regions;

  const merged: ChangeRegion[] = [];
  const used = new Set<number>();

  for (let i = 0; i < regions.length; i++) {
    if (used.has(i)) continue;
    let r = { ...regions[i] };
    used.add(i);

    let changed = true;
    while (changed) {
      changed = false;
      for (let j = 0; j < regions.length; j++) {
        if (used.has(j)) continue;
        const s = regions[j];
        // Check overlap or proximity (within 3% of image)
        const margin = 0.03;
        if (
          r.x - margin <= s.x + s.width &&
          r.x + r.width + margin >= s.x &&
          r.y - margin <= s.y + s.height &&
          r.y + r.height + margin >= s.y
        ) {
          // Merge bounding boxes
          const newX = Math.min(r.x, s.x);
          const newY = Math.min(r.y, s.y);
          const newRight = Math.max(r.x + r.width, s.x + s.width);
          const newBottom = Math.max(r.y + r.height, s.y + s.height);
          r = {
            x: newX,
            y: newY,
            width: newRight - newX,
            height: newBottom - newY,
            area: r.area + s.area,
            intensity: Math.max(r.intensity, s.intensity),
          };
          used.add(j);
          changed = true;
        }
      }
    }
    merged.push(r);
  }

  return merged;
}

/**
 * Filter and rank meaningful regions
 */
function filterAndRankRegions(regions: ChangeRegion[]): ChangeRegion[] {
  let filtered = regions.filter(
    (r) => r.intensity >= ANALYSIS_CONFIG.minRegionIntensity
  );

  // Sort by area (largest first)
  filtered.sort((a, b) => b.area - a.area);

  return filtered.slice(0, ANALYSIS_CONFIG.maxRegions);
}

/**
 * Add slight padding to region bounds (as fraction of image)
 */
function padRegion(region: Region, padding: number = 0.02): Region {
  return {
    x: Math.max(0, region.x - padding),
    y: Math.max(0, region.y - padding),
    width: Math.min(1 - Math.max(0, region.x - padding), region.width + padding * 2),
    height: Math.min(1 - Math.max(0, region.y - padding), region.height + padding * 2),
  };
}

/**
 * Convert regions to Change objects
 */
function regionsToChanges(regions: ChangeRegion[]): Change[] {
  return regions.map((region, idx) => {
    const paddedRegion = padRegion({
      x: region.x,
      y: region.y,
      width: region.width,
      height: region.height,
    });

    const confidenceLevel =
      region.intensity > 0.5
        ? "high"
        : region.intensity > 0.25
          ? "medium"
          : ("low" as const);

    return {
      id: `change-${idx + 1}`,
      type: "uncertain" as const,
      title: `Visual Change ${idx + 1}`,
      description:
        "A significant visual difference was detected in this region.",
      confidence: Math.min(0.95, 0.4 + region.intensity * 0.55),
      confidenceLevel,
      region: paddedRegion,
    };
  });
}

/**
 * Generate a difference map as an ImageData for the difference view mode.
 * The map shows differences overlaid on a dimmed version of the original.
 */
export function generateDifferenceMap(
  beforeData: ImageData,
  afterData: ImageData,
): ImageData {
  const width = beforeData.width;
  const height = beforeData.height;
  const result = new ImageData(width, height);

  const grayBefore = toGrayscale(beforeData);
  const grayAfter = toGrayscale(afterData);

  // Start with a desaturated version of the before image
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    const gray = grayBefore[i];
    result.data[idx] = gray;
    result.data[idx + 1] = gray;
    result.data[idx + 2] = gray;
    result.data[idx + 3] = 255;
  }

  // Overlay differences in red/green
  for (let i = 0; i < width * height; i++) {
    const diff = Math.abs(grayBefore[i] - grayAfter[i]);
    if (diff > ANALYSIS_CONFIG.differenceThreshold) {
      const idx = i * 4;
      // More bright = removed (was in before), darker = added (in after)
      if (grayBefore[i] > grayAfter[i]) {
        // Region got darker → something may have been added/blocking
        result.data[idx] = Math.min(255, 100 + diff);
        result.data[idx + 1] = 50;
        result.data[idx + 2] = 50;
      } else {
        // Region got brighter → something may have been removed
        result.data[idx] = 50;
        result.data[idx + 1] = Math.min(255, 100 + diff);
        result.data[idx + 2] = 50;
      }
      result.data[idx + 3] = 255;
    }
  }

  return result;
}

/**
 * Represents the different stages of analysis for the progress indicator
 */
export type AnalysisStage =
  | "preparing"
  | "aligning"
  | "detecting"
  | "filtering"
  | "identifying"
  | "complete";

export type ProgressCallback = (stage: AnalysisStage) => void;

/**
 * Main image analysis function.
 * Processes the before/after images through a real computer-vision pipeline:
 *   Normalize → Grayscale → Blur → Diff → Threshold → Morphological open → Connected components → Merge → Filter
 */
export async function analyzeImages(
  beforeFile: File,
  afterFile: File,
  onProgress?: ProgressCallback
): Promise<AnalyzeResponse> {
  try {
    const startTime = performance.now();

    // ── Stage 1: Prepare images ──
    onProgress?.("preparing");

    // First pass: get natural sizes
    const [beforeSize, afterSize] = await Promise.all([
      getImageSize(beforeFile),
      getImageSize(afterFile),
    ]);

    const analysisSize = calcAnalysisSize(
      beforeSize.width,
      beforeSize.height,
      afterSize.width,
      afterSize.height
    );

    // Load and resize both to the same dimensions
    const [beforeResult, afterResult] = await Promise.all([
      fileToImageData(beforeFile, analysisSize.width, analysisSize.height),
      fileToImageData(afterFile, analysisSize.width, analysisSize.height),
    ]);

    const beforeData = beforeResult.data;
    const afterData = afterResult.data;
    const { width, height } = analysisSize;

    // Allow the UI to update
    await sleep(60);

    // ── Stage 2: Align / compare scenes ──
    onProgress?.("aligning");

    const grayBefore = toGrayscale(beforeData);
    const grayAfter = toGrayscale(afterData);

    const similarity = computeSimilarity(grayBefore, grayAfter, width, height);

    await sleep(60);

    // If images are very different, warn the user
    if (similarity < 0.3) {
      return {
        summary: { totalChanges: 0 },
        changes: [],
        message:
          "These images appear to show different scenes. Try using photos taken from a similar position.",
        metadata: {
          processingTime: performance.now() - startTime,
          imageWidth: width,
          imageHeight: height,
        },
      };
    }

    // ── Stage 3: Detect differences ──
    onProgress?.("detecting");

    // Apply blur to reduce noise / JPEG artifacts
    const blurredBefore = boxBlur(grayBefore, width, height, ANALYSIS_CONFIG.blurRadius);
    const blurredAfter = boxBlur(grayAfter, width, height, ANALYSIS_CONFIG.blurRadius);

    const difference = calculateGrayDifference(blurredBefore, blurredAfter);
    const thresholded = thresholdDifference(
      difference,
      ANALYSIS_CONFIG.differenceThreshold
    );

    await sleep(60);

    // ── Stage 4: Filter noise ──
    onProgress?.("filtering");

    const cleaned = morphologicalOpen(
      thresholded,
      width,
      height,
      ANALYSIS_CONFIG.morphRadius
    );

    await sleep(60);

    // ── Stage 5: Identify regions ──
    onProgress?.("identifying");

    let regions = findConnectedComponents(cleaned, width, height);
    regions = mergeOverlappingRegions(regions);
    const meaningfulRegions = filterAndRankRegions(regions);

    const changes = regionsToChanges(meaningfulRegions);

    await sleep(60);

    // ── Stage 6: Complete ──
    onProgress?.("complete");

    if (changes.length === 0) {
      return {
        summary: { totalChanges: 0 },
        changes: [],
        message: "No meaningful changes detected.",
        metadata: {
          processingTime: performance.now() - startTime,
          imageWidth: width,
          imageHeight: height,
        },
      };
    }

    return {
      summary: { totalChanges: changes.length },
      changes,
      metadata: {
        processingTime: performance.now() - startTime,
        imageWidth: width,
        imageHeight: height,
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

/**
 * Get natural size of an image file without rendering at full size
 */
function getImageSize(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
