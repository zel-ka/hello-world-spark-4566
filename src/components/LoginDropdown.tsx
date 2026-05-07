import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User2, Heart } from "lucide-react";
import AuthForm from "./AuthForm";

const displayUsername = (email?: string | null) => {
  if (!email) return "";
  // Strip internal @app.local domain so users only see the username
  return email.replace(/@app\.local$/i, "");
};

export default function LoginDropdown({ 
  className = "",
  variant = "default" as "default" | "cta"
}: { 
  className?: string; 
  variant?: "default" | "cta";
}) {
  const { user, profile, signOut, loading } = useAuth();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setIsOpen(false); // Close on login
    }
  }, [user]);

  const onAuthSuccess = () => {
    setIsOpen(false);
  };

  const buttonClass = variant === "cta" 
    ? "w-full px-8 h-12 sm:h-14 lg:h-16 rounded-2xl text-base sm:text-lg lg:text-xl font-bold border-2 border-slate-300 hover:border-blue-500 hover:bg-slate-50 text-slate-900 transition-all"
    : "px-6 h-12 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-glow hover:shadow-xl hover:-translate-y-0.5";

  if (loading) {
    return (
      <Button className={`${buttonClass} rounded-xl ${className}`} disabled>
        ...
      </Button>
    );
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-12 w-12 rounded-full p-0 hover:bg-blue-100/50 border-2 border-white/50 shadow-glow hover:shadow-md transition-all"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm">
                {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          sideOffset={8}
          className="w-72 sm:w-80 p-0 rounded-2xl border-0 frosted-glass shadow-2xl animate-in slide-in-from-top-4 fade-in-0 duration-300 min-w-0"
        >
          <div className="p-4 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{profile?.full_name || displayUsername(user.email)}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[180px]">@{displayUsername(user.email)}</p>
              </div>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer focus:bg-blue-50 rounded-lg mx-1 my-0.5">
            <User2 className="h-4 w-4 mr-2" />
            {t('common.profile')}
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer focus:bg-red-50 rounded-lg mx-1 my-0.5 text-red-600 font-medium"
            onClick={async () => {
              await signOut();
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('common.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button className={`${buttonClass} rounded-xl ${className}`}>
          {t('common.login')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        sideOffset={12}
        className="w-[92vw] sm:w-96 p-0 rounded-3xl border-0 frosted-glass shadow-2xl [animation:dropdown-unfold_300ms_cubic-bezier(0.16,1,0.3,1)] sm:[animation-fill-mode:forwards]"
      >
        <div className="[transform-origin:top_right] animate-dropdown-unfold p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <Heart className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-base text-foreground">{t('common.appName')}</h3>
          </div>
          <AuthForm 
            t={t} 
            onSuccess={onAuthSuccess}
            className="!p-0 !bg-transparent !border-0 !shadow-none [&>*]:!space-y-2.5"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
