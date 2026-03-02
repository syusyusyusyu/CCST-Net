"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface KeyTermTooltipProps {
  term: string;
  reading?: string;
  children: React.ReactNode;
}

export function KeyTerm({ term, reading, children }: KeyTermTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help border-b border-dashed border-primary font-bold text-primary">
          {term}
          {reading && <span className="sr-only"> ({reading})</span>}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">{children}</p>
      </TooltipContent>
    </Tooltip>
  );
}
