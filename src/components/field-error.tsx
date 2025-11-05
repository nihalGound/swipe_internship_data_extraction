"use client";

import { AlertCircle } from "lucide-react";

interface FieldErrorBadgeProps {
  errors?: string[];
  label: string;
}

export function FieldErrorBadge({ errors, label }: FieldErrorBadgeProps) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
      <span className="text-xs text-red-300">{label}</span>
    </div>
  );
}
