import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import AuthForm from "./AuthForm";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuestLockDialog({ open, onOpenChange }: Props) {
  const { t } = useI18n();
  const [showAuth, setShowAuth] = useState<null | "login" | "signup">(null);

  const close = () => {
    setShowAuth(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setShowAuth(null); onOpenChange(o); }}>
      <DialogContent className="rounded-3xl max-w-sm">
        {!showAuth ? (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-2">
                <img src="/TathminiAfyaLogo.png" alt="Tathmini Afya Logo" className="h-12 w-12 rounded-2xl" />
              </div>
              <DialogTitle>{t("guest.lockTitle")}</DialogTitle>
              <DialogDescription>{t("guest.lockDesc")}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 pt-2">
              <Button className="w-full h-11 rounded-xl" onClick={() => setShowAuth("signup")}>
                {t("guest.signUp")}
              </Button>
              <Button variant="outline" className="w-full h-11 rounded-xl" onClick={() => setShowAuth("login")}>
                {t("guest.login")}
              </Button>
              <Button variant="ghost" className="w-full h-10 rounded-xl text-muted-foreground" onClick={close}>
                {t("guest.continue")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 justify-center mb-2">
                <img src="/TathminiAfyaLogo.png" alt="Tathmini Afya Logo" className="h-8 w-8" />
                <DialogTitle>{t("common.appName")}</DialogTitle>
              </div>
              <DialogDescription className="text-center">
                {showAuth === "login" ? t("auth.login") : t("auth.signup")}
              </DialogDescription>
            </DialogHeader>
            <AuthForm
              t={t}
              mode={showAuth}
              onModeChange={(m) => setShowAuth(m)}
              onSuccess={close}
              className="!p-0 !bg-transparent !border-0 !shadow-none"
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
