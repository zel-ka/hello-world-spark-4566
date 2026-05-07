import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  navItems: Array<{ id: string; label: string }>;
  activeItem?: string;
  onNavigate?: (id: string) => void;
  children: ReactNode;
}

export function DashboardLayout({
  title,
  subtitle,
  navItems,
  activeItem,
  onNavigate,
  children,
}: DashboardLayoutProps) {
  const { profile, roles, signOut } = useAuth();
  const role = roles.includes("patient") ? "Patient" : roles.includes("doctor") ? "Doctor" : "Admin";

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="premium-card border border-border/50 px-5 pt-12 pb-5 shadow-soft">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar>
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? "avatar"} />
              ) : (
                <AvatarFallback>{profile?.full_name?.slice(0, 1) ?? "P"}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">{role} dashboard</p>
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge>{role}</Badge>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-xl px-5 py-3">
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const active = activeItem === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate?.(item.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/80 text-muted-foreground hover:bg-secondary"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="px-5 pt-6">{children}</main>
    </div>
  );
}
