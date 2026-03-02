"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SingleChoiceProps {
  options: { id: string; text: string }[];
  selected: string | null;
  correctAnswer?: string;
  showResult: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function SingleChoice({ options, selected, correctAnswer, showResult, onSelect, disabled }: SingleChoiceProps) {
  return (
    <RadioGroup value={selected ?? ""} onValueChange={onSelect} disabled={disabled}>
      <div className="space-y-2">
        {options.map(option => {
          let bgClass = "";
          if (showResult && correctAnswer) {
            if (option.id === correctAnswer) {
              bgClass = "border-success bg-success/10";
            } else if (option.id === selected) {
              bgClass = "border-destructive bg-destructive/10";
            }
          } else if (option.id === selected) {
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
              onClick={() => !disabled && !showResult && onSelect(option.id)}
            >
              <RadioGroupItem value={option.id} id={`option-${option.id}`} />
              <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer text-sm">
                {option.text}
              </Label>
              {showResult && option.id === correctAnswer && (
                <span className="text-sm font-medium text-success">✓</span>
              )}
              {showResult && option.id === selected && option.id !== correctAnswer && (
                <span className="text-sm font-medium text-destructive">✕</span>
              )}
            </div>
          );
        })}
      </div>
    </RadioGroup>
  );
}
