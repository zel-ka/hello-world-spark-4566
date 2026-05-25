import { useEffect, useMemo } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type PopupVariant = "info" | "warning" | "success" | "feature";

interface SmartPopupProps {
  open: boolean;
  title: string;
  description: string;
  variant?: PopupVariant;
  ctaLabel: string;
  actionLabel?: string;
  laterLabel?: string;
  onAction: () => void;
  onLater: () => void;
  onClose: () => void;
}

const variantStyles: Record<PopupVariant, string> = {
  info: "bg-primary/10 text-foreground border border-primary/20",
  warning: "bg-warning/10 text-foreground border border-warning/20",
  success: "bg-success/10 text-foreground border border-success/20",
  feature: "bg-secondary/10 text-foreground border border-secondary/20",
};

export function SmartPopup({
  open,
  title,
  description,
  variant = "info",
  ctaLabel,
  actionLabel = "Later",
  laterLabel = "Remind me later",
  onAction,
  onLater,
  onClose,
}: SmartPopupProps) {
  const panelClasses = useMemo(
    () => cn(
      "rounded-[28px] border p-6 shadow-soft backdrop-blur-xl w-full max-w-md",
      variantStyles[variant],
    ),
    [variant],
  );

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className={panelClasses}>
        <div className="flex items-start justify-between gap-3">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold leading-tight">{title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {description}
            </DialogDescription>
          </DialogHeader>

          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/90 text-muted-foreground transition hover:bg-background"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
        </div>

        <DialogFooter className="mt-6 gap-2">
          <Button variant="default" className="min-w-[120px]" onClick={onAction}>
            {ctaLabel}
          </Button>
          <Button variant="outline" className="min-w-[120px]" onClick={onLater}>
            {laterLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
