import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Info, AlertTriangle } from "lucide-react";

interface AlertBannerProps {
  title: string;
  description: string;
  variant?: "success" | "warning" | "danger";
}

const iconMap = {
  success: CheckCircle2,
  warning: Info,
  danger: AlertTriangle,
} as const;

const colorMap = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
} as const;

export function AlertBanner({ title, description, variant = "warning" }: AlertBannerProps) {
  const Icon = iconMap[variant];

  return (
    <Alert className={`border ${colorMap[variant]} ring-offset-background shadow-sm`} variant={variant === "danger" ? "destructive" : "default"}>
      <Icon className="h-4 w-4 mr-3 inline-block" />
      <div>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </div>
    </Alert>
  );
}
