"use client";

import { useState, useEffect } from "react";

interface ExtractionLoaderProps {
  isVisible: boolean;
}

export function ExtractionLoader({ isVisible }: ExtractionLoaderProps) {
  const [stage, setStage] = useState(0);

  const stages = [
    { label: "Processing Files", duration: 1000 },
    { label: "Extracting Data", duration: 1500 },
    { label: "Validating Information", duration: 1200 },
    { label: "Organizing Results", duration: 1000 },
  ];

  useEffect(() => {
    if (!isVisible) {
      setStage(0);
      return;
    }

    const timer = setInterval(() => {
      setStage((prev) => (prev + 1) % stages.length);
    }, stages[stage].duration);

    return () => clearInterval(timer);
  }, [isVisible, stage, stages]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg w-full max-w-md border border-slate-800 p-8 shadow-2xl flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
        </div>

        <p className="text-lg font-medium text-white">Extracting data</p>

        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1.5s",
              }}
            />
          ))}
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            {stages[stage].label}
          </h3>
        </div>


        <div className="h-6 flex items-center justify-center">
          <p className="text-xs text-slate-500 animate-fade-in">
            {stage === 0 && "Reading and analyzing file contents..."}
            {stage === 1 && "Extracting invoices, products, and customers..."}
            {stage === 2 && "Checking data completeness and accuracy..."}
            {stage === 3 && "Preparing results for display..."}
          </p>
        </div>
      </div>
    </div>
  );
}
