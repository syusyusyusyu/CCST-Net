"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmSubmitDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  unansweredCount: number;
}

export function ConfirmSubmitDialog({ open, onClose, onConfirm, unansweredCount }: ConfirmSubmitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>試験を提出しますか？</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {unansweredCount > 0 ? (
            <p>未回答の問題が <strong>{unansweredCount} 問</strong>あります。提出しますか？</p>
          ) : (
            <p>提出後は回答を変更できません。</p>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            {unansweredCount > 0 ? "問題に戻る" : "キャンセル"}
          </Button>
          <Button onClick={onConfirm}>提出する</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
