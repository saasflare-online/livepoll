"use client";

import React from "react";

interface LiveIndicatorProps {
  secondsSinceUpdate: number;
}

export function LiveIndicator({ secondsSinceUpdate }: LiveIndicatorProps) {
  return (
    <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-gray-500">
      <div className="flex items-center gap-2">
         <div className="live-dot" />
         <span>Network Live</span>
      </div>
      <div className="h-3 w-[1px] bg-white/10" />
      <span>Updated {secondsSinceUpdate}s ago</span>
    </div>
  );
}
