import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, User, ArrowRight, AtSign } from "lucide-react";
import LoginSuccess from "@/components/LoginSuccess";

interface AuthFormProps {
  t: (key: string) => string;
  onSuccess: () => void;
  mode?: "login" | "signup";
  onModeChange?: (newMode: "login" | "signup") => void;
  className?: string;
}

const INTERNAL_EMAIL_DOMAIN = "app.local";
const usernameToEmail = (u: string) => `${u.trim().toLowerCase()}@${INTERNAL_EMAIL_DOMAIN}`;
const isValidUsername = (u: string) => /^[a-zA-Z0-9_.-]{3,30}$/.test(u);

export default function AuthForm({
  t,
  onSuccess,
  mode: initialMode = "login",
  onModeChange,
  className = "",
}: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidUsername(username)) {
      toast.error(t('auth.usernameInvalid'));
      return;
    }
    if (password.length < 6) {
      toast.error(t('auth.passwordMin'));
      return;
    }

    setLoading(true);
    const email = usernameToEmail(username);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName || username, username },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        if (data?.user?.identities?.length === 0) {
          toast.error(t('auth.usernameTaken'));
        } else {
          // Auto sign-in (auto-confirm enabled)
          await supabase.auth.signInWithPassword({ email, password });
          setShowSuccess(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(t('auth.loginError'));
          setLoading(false);
          return;
        }
        setShowSuccess(true);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setFullName("");
    if (onModeChange) onModeChange("login");
  };

  const toggleMode = () => {
    const newMode = mode === "login" ? "signup" : "login";
    setMode(newMode);
    if (onModeChange) onModeChange(newMode);
    resetForm();
  };

  return (
    <>
      {showSuccess && <LoginSuccess message={t('common.login') + "!"} onDone={onSuccess} />}
      <div className={`space-y-3 p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl ${className}`}>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {mode === "signup" && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('auth.fullName')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 h-11 rounded-xl text-sm border-2 focus:border-blue-500"
                disabled={loading}
              />
            </div>
          )}
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              autoComplete="username"
              placeholder={t('auth.username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 h-11 rounded-xl text-sm border-2 focus:border-blue-500"
              required
              minLength={3}
              maxLength={30}
              disabled={loading}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-11 rounded-xl text-sm border-2 focus:border-blue-500"
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 rounded-xl text-sm font-bold !bg-blue-600 hover:!bg-blue-700 !text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            disabled={loading}
          >
            <span>{loading ? t('common.loading') : (mode === "login" ? t('auth.login') : t('auth.signup'))}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground px-2">
          {mode === "login" ? t('auth.noAccount') : t('auth.haveAccount')}
          <button
            onClick={toggleMode}
            className="text-blue-600 font-semibold ml-1 hover:text-blue-700 transition-colors"
            disabled={loading}
          >
            {mode === "login" ? t('auth.signup') : t('auth.login')}
          </button>
        </p>
      </div>
    </>
  );
}
