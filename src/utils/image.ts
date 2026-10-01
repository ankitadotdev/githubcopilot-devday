export function validateImageFile(file: File): string | null {
  const supportedFormats = ["image/jpeg", "image/png", "image/webp"];
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB

  if (!supportedFormats.includes(file.type)) {
    return "Unsupported file format. Please use JPG, PNG, or WEBP.";
  }

  if (file.size > maxSizeBytes) {
    return "File is too large. Maximum size is 10MB.";
  }

  return null;
}

export function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = src;
  });
}

export function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}
