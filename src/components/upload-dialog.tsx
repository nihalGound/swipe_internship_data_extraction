"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Upload, X, File, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFiles } from "@/lib/api-client";
import { useAppDispatch } from "@/redux/hooks";
import { toast } from "sonner";

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_FORMATS = [".pdf", ".xlsx", ".xls", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadDialog({ isOpen, onClose }: UploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  const validateFiles = (
    filesToValidate: File[]
  ): { valid: File[]; errors: { [key: string]: string } } => {
    const valid: File[] = [];
    const errors: { [key: string]: string } = {};

    filesToValidate.forEach((file) => {
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

      if (!SUPPORTED_FORMATS.includes(fileExtension)) {
        errors[
          file.name
        ] = `Unsupported format. Supported formats: ${SUPPORTED_FORMATS.join(
          ", "
        )}`;
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors[file.name] = `File size exceeds 10MB limit (${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB)`;
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const { valid, errors } = validateFiles(newFiles);

      setFiles((prev) => [...prev, ...valid]);
      setFileErrors((prev) => ({ ...prev, ...errors }));

      if (Object.keys(errors).length > 0) {
        toast.warning("Some files could not be added", {
          description: "Check file format and size (max 10MB)",
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const { valid, errors } = validateFiles(droppedFiles);

      setFiles((prev) => [...prev, ...valid]);
      setFileErrors((prev) => ({ ...prev, ...errors }));

      if (Object.keys(errors).length > 0) {
        toast.warning("Some files could not be added", {
          description: "Check file format and size (max 10MB)",
        });
      }
    }
  };

  const removeFile = (fileName: string) => {
    setFiles(files.filter((f) => f.name !== fileName));
    const { [fileName]: _, ...rest } = fileErrors;
    setFileErrors(rest);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.warning("No files selected", {
        description: "Please select at least one file.",
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const result = await uploadFiles(formData, dispatch);
    setIsLoading(false);

    if (result.success) {
      toast.success("Success", {
        description: "Files uploaded and data extracted successfully!",
      });
      setFiles([]);
      setFileErrors({});
      onClose();
    } else {
      toast.error("Extraction Error", {
        description: result.error || "Failed to extract data from files",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg p-8 w-full max-w-md border border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Upload Files</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Supported Formats Info */}
        <div className="bg-blue-950/30 border border-blue-800 rounded-lg p-3 mb-6">
          <div className="flex gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 font-semibold">Supported formats</p>
              <p className="text-blue-200 text-xs">
                {SUPPORTED_FORMATS.join(", ")} • Max 10MB per file
              </p>
            </div>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center mb-6 hover:border-blue-500 transition-colors"
        >
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-300 mb-2">Drag and drop files here or</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="border-slate-600 text-blue-400 hover:bg-slate-800"
          >
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            accept={SUPPORTED_FORMATS.join(",")}
            className="hidden"
          />
        </div>

        {Object.keys(fileErrors).length > 0 && (
          <div className="bg-red-950/30 border border-red-800 rounded-lg p-3 mb-6">
            <div className="space-y-1">
              {Object.entries(fileErrors).map(([fileName, error]) => (
                <div key={fileName} className="text-xs text-red-300">
                  <strong>{fileName}:</strong> {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="text-xs text-slate-400">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </p>
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between bg-slate-800 p-3 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4 text-blue-400" />
                  <div className="text-left">
                    <span className="text-sm text-slate-300 truncate block">
                      {file.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)}MB
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.name)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || files.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}
