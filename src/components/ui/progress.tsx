import React from "react";
import { cn } from "../../lib/utils";

interface ProgressProps {
  value?: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value = 0, className }) => {
  return (
    <div className={cn("relative w-full overflow-hidden rounded-full bg-gray-200", className)}>
      <div
        className="h-full w-full flex-1 bg-black transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
};