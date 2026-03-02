"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MultipleChoiceProps {
  options: { id: string; text: string }[];
  selected: string[];
  correctAnswers?: string[];
  showResult: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
  requiredCount: number;
}

export function MultipleChoice({ options, selected, correctAnswers, showResult, onToggle, disabled, requiredCount }: MultipleChoiceProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        選択中: {selected.length} / {requiredCount}
      </p>
      {options.map(option => {
        const isSelected = selected.includes(option.id);
        const isCorrect = correctAnswers?.includes(option.id);

        let bgClass = "";
        if (showResult && correctAnswers) {
          if (isCorrect) {
            bgClass = "border-success bg-success/10";
          } else if (isSelected) {
            bgClass = "border-destructive bg-destructive/10";
          }
        } else if (isSelected) {
          bgClass = "border-primary bg-primary/5";
        }

        return (
          <div
            key={option.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 transition-colors",
              !disabled && !showResult && "cursor-pointer hover:bg-accent",
              bgClass
            )}
            onClick={() => !disabled && !showResult && onToggle(option.id)}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => !disabled && !showResult && onToggle(option.id)}
              disabled={disabled || showResult}
            />
            <Label className="flex-1 cursor-pointer text-sm">{option.text}</Label>
            {showResult && isCorrect && (
              <span className="text-sm font-medium text-success">✓</span>
            )}
            {showResult && isSelected && !isCorrect && (
              <span className="text-sm font-medium text-destructive">✕</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
