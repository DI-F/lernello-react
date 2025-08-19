import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Mock i18n hook for default values
const useTranslation = () => ({
  t: (key: string, defaultText: string) => defaultText,
});

interface ConfirmDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  danger = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  // Providing default values similar to the Svelte component
  const dialogTitle =
    title ?? t("dialog.action.title", "Are you absolutely sure?");
  const dialogMessage =
    message ?? t("dialog.action.message", "This action cannot be undone.");
  const confirmButtonText = confirmText ?? t("common.confirm", "Confirm");
  const cancelButtonText = cancelText ?? t("common.cancel", "Cancel");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogMessage}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel}>
            {cancelButtonText}
          </Button>
          <Button
            variant={danger ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
