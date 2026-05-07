import { type ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CalculatorCardProps {
  title: string;
  value: string;
  status: string;
  description: string;
  tone?: "success" | "warning" | "danger" | "default";
  children?: React.ReactNode;
}

const toneClasses: Record<string, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  default: "bg-muted/10 text-muted-foreground border-border",
};

const gradientMap: Record<string, string> = {
  success: "from-success/20 via-success/5 to-primary/10",
  warning: "from-warning/20 via-warning/5 to-primary/10",
  danger: "from-destructive/20 via-destructive/5 to-primary/10",
  default: "from-primary/20 via-primary/5 to-secondary/10",
};

export function CalculatorCard({ title, value, status, description, tone = "default", children }: CalculatorCardProps) {
  const gradientClass = gradientMap[tone];

  return (
    <div className="group scroll-scale-in">
      {/* Gradient overlay background */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradientClass} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
      
      <Card className="relative rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-soft md:shadow-sm backdrop-blur-md overflow-hidden transition-all duration-500 ease-out group-hover:border-primary/40 group-hover:shadow-elevated group-hover:-translate-y-1 group-hover:scale-[1.02] press-zoom hover-lift">
        {/* Animated gradient shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>

        {/* Content with parallax effect */}
        <div className="relative">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary via-foreground to-foreground/80 transition-all duration-500">{title}</CardTitle>
              <Badge className={cn("rounded-full px-2 py-1 text-[11px] font-semibold shadow-soft group-hover:shadow-md transition-all duration-500 group-hover:scale-110", toneClasses[tone])}>{status}</Badge>
            </div>
            <CardDescription className="group-hover:text-muted-foreground transition-colors duration-500">{description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary/80 to-foreground/60 bg-clip-text text-transparent group-hover:from-primary via-foreground to-primary/60 transition-all duration-700 scale-100 group-hover:scale-105 origin-left">{value}</p>
          </CardContent>
          {children ? <CardFooter className="gap-3 flex-wrap">{children}</CardFooter> : null}
        </div>
      </Card>
    </div>
  );
}
