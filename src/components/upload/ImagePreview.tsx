import React from "react";
import { Upload, X, CheckCircle } from "lucide-react";
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
      <h3 className="text-xl font-bold mb-4 gradient-heading">{label}</h3>

      {preview ? (
        <div className="relative card-shadow bg-white rounded-2xl border border-gray-200 overflow-hidden group">
          <img
            src={preview}
            alt={label}
            className="w-full h-auto max-h-96 object-contain"
          />
          <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-2 shadow-lg">
            <CheckCircle size={20} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 justify-end">
            <button
              onClick={() => document.getElementById(`${label}-input`)?.click()}
              disabled={disabled}
              className="button-secondary text-sm"
            >
              Replace
            </button>
            <button
              onClick={handleRemove}
              disabled={disabled}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg p-2 transition font-semibold"
              aria-label={`Remove ${label}`}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition cursor-pointer ${
            dragActive
              ? "border-blue-500 bg-blue-50 scale-105"
              : "border-blue-300 bg-white hover:border-blue-400 hover:bg-blue-50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="mb-4">
            <Upload className="mx-auto mb-3 text-blue-500" size={48} strokeWidth={1.5} />
          </div>
          <p className="text-gray-700 mb-2 font-semibold text-lg">
            Drop your {label.toLowerCase()} image here
          </p>
          <p className="text-sm text-gray-500">or click to browse</p>
          <p className="text-xs text-gray-400 mt-3">JPG, PNG, WEBP up to 10MB</p>

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
