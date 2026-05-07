import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <div className="group scroll-fade-in">
      {/* Gradient overlay background */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-secondary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <Card className="relative rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-soft md:shadow-sm backdrop-blur-md overflow-hidden transition-all duration-500 ease-out group-hover:border-primary/40 group-hover:shadow-elevated group-hover:-translate-y-1 group-hover:scale-[1.02] press-zoom hover-lift">
        {/* Animated gradient shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
        
        {/* Content with parallax effect */}
        <div className="relative">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary via-foreground to-foreground/80 transition-all duration-500">{title}</CardTitle>
            <p className="text-sm text-muted-foreground/90 group-hover:text-muted-foreground transition-colors duration-500">{description}</p>
          </CardHeader>
          <CardContent className="pt-0 animate-fade-in">{children}</CardContent>
        </div>
      </Card>
    </div>
  );
}
