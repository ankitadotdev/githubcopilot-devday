import React from "react";
import { Upload, X } from "lucide-react";
import { validateImageFile, revokeObjectURL } from "../../utils/image";

interface ImagePreviewProps {
  label: string;
  file: File | null;
  preview: string | null;
  onFileChange: (file: File | null) => void;
  onDrop: (file: File) => void;
  disabled?: boolean;
}

export function ImagePreview({
  label,
  preview,
  onFileChange,
  onDrop,
  disabled = false,
}: ImagePreviewProps) {
  const [dragActive, setDragActive] = React.useState(false);

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
  };

  const handleRemove = () => {
    if (preview) {
      revokeObjectURL(preview);
    }
    onFileChange(null);
  };

  return (
    <div className="flex-1">
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        {label}
      </label>

      {preview ? (
        <div className="image-card relative group">
          <img
            src={preview}
            alt={label}
            className="w-full h-auto max-h-96 object-contain bg-gray-50"
          />
          <div className="absolute top-2 right-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex">
            <button
              onClick={() => document.getElementById(`${label}-input`)?.click()}
              disabled={disabled}
              className="button-sm"
            >
              Replace
            </button>
            <button
              onClick={handleRemove}
              disabled={disabled}
              className="button-danger"
              aria-label={`Remove ${label}`}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`image-card p-8 md:p-12 text-center transition cursor-pointer ${
            dragActive
              ? "upload-area-border drag-active"
              : "upload-area-border"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Upload className="mx-auto mb-3 text-gray-400" size={32} strokeWidth={1.5} />
          <p className="text-gray-900 font-medium mb-1">
            Drag image here or click to browse
          </p>
          <p className="text-xs text-gray-500">JPG, PNG, WEBP up to 10MB</p>

          <input
            id={`${label}-input`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInput}
            disabled={disabled}
            className="hidden"
            aria-label={`Upload ${label} image`}
          />
        </div>
      )}
    </div>
  );
}
