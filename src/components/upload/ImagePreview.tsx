import React from "react";
import { Upload, X, RefreshCw } from "lucide-react";
import { validateImageFile } from "../../utils/image";

interface ImagePreviewProps {
  label: string;
  file: File | null;
  preview: string | null;
  onFileChange: (file: File | null) => void;
  onDrop: (file: File) => void;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImagePreview({
  label,
  file,
  preview,
  onFileChange,
  onDrop,
  disabled = false,
}: ImagePreviewProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [dimensions, setDimensions] = React.useState<{
    width: number;
    height: number;
  } | null>(null);
  const inputId = `${label}-input`;

  // Load image dimensions asynchronously when preview URL changes
  React.useEffect(() => {
    if (!preview) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setDimensions({ width: img.width, height: img.height });
    };
    img.src = preview;
    return () => { cancelled = true; };
  }, [preview]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const error = validateImageFile(files[0]);
      if (error) {
        alert(error);
        return;
      }
      onDrop(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      const error = validateImageFile(files[0]);
      if (error) {
        alert(error);
        return;
      }
      onFileChange(files[0]);
    }
    // Reset input so the same file can be re-selected
    e.currentTarget.value = "";
  };

  const handleRemove = () => {
    onFileChange(null);
  };

  const handleClickDropZone = () => {
    if (!disabled) {
      document.getElementById(inputId)?.click();
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">
        {label}
      </label>

      {preview ? (
        <div className="image-card relative group">
          <img
            src={preview}
            alt={label}
            className="w-full h-auto max-h-96 object-contain bg-gray-50"
          />
          {/* Overlay actions on hover */}
          <div className="absolute top-3 right-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex">
            <button
              onClick={() => document.getElementById(inputId)?.click()}
              disabled={disabled}
              className="button-sm flex items-center gap-1"
            >
              <RefreshCw size={12} />
              Replace
            </button>
            <button
              onClick={handleRemove}
              disabled={disabled}
              className="button-danger"
              aria-label={`Remove ${label}`}
            >
              <X size={14} />
            </button>
          </div>

          {/* File info bar */}
          {file && (
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-600 truncate font-medium">
                {file.name}
              </span>
              <span className="text-xs text-gray-400 shrink-0 ml-3">
                {dimensions
                  ? `${dimensions.width}×${dimensions.height}`
                  : ""}
                {" · "}
                {formatFileSize(file.size)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClickDropZone}
          className={`upload-area-border p-10 md:p-14 text-center transition cursor-pointer ${
            dragActive ? "drag-active" : ""
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Upload
            className="mx-auto mb-4 text-gray-300"
            size={36}
            strokeWidth={1.5}
          />
          <p className="text-gray-700 font-medium text-sm mb-1">
            Drop image here or click to browse
          </p>
          <p className="text-xs text-gray-400">JPG, PNG, WEBP · up to 10 MB</p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
        aria-label={`Upload ${label} image`}
      />
    </div>
  );
}
