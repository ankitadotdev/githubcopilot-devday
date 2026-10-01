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
      <h3 className="text-lg font-semibold mb-4 text-gray-900">{label}</h3>

      {preview ? (
        <div className="relative bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <img
            src={preview}
            alt={label}
            className="w-full h-auto max-h-96 object-contain"
          />
          <button
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-full p-2 transition"
            aria-label={`Remove ${label}`}
          >
            <X size={20} />
          </button>
          <button
            onClick={() => document.getElementById(`${label}-input`)?.click()}
            disabled={disabled}
            className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition"
          >
            Replace
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Upload className="mx-auto mb-3 text-gray-400" size={32} />
          <p className="text-gray-600 mb-2">Drop image here or click to browse</p>
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
