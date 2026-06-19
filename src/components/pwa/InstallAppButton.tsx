import { useEffect, useMemo, useState } from "react";
import { Download, Share, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "ios" | "android" | "desktop" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  if (/mac|win|linux/.test(ua)) return "desktop";
  return "other";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia?.("(display-mode: standalone)").matches;
  const ios = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return Boolean(mq || ios);
}

export function InstallAppButton({ className }: { className?: string }) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());
  const platform = useMemo(detectPlatform, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
      setInstructionsOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (installed) return null;

  const handleInstallClick = async () => {
    // Native prompt path (Android Chrome / Edge / Desktop Chromium)
    if (installEvent) {
      try {
        await installEvent.prompt();
        const choice = await installEvent.userChoice;
        if (choice.outcome === "accepted") {
          setInstalled(true);
          setInstallEvent(null);
          return;
        }
      } catch (error) {
        console.warn("Install prompt failed", error);
      } finally {
        setInstallEvent(null);
      }
    }
    // Fallback: platform-specific instructions (iOS Safari has no prompt API)
    setInstructionsOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        variant="default"
        size="sm"
        className={className}
        onClick={handleInstallClick}
      >
        <Download className="h-4 w-4 mr-2" />
        Download App
      </Button>
      <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sakinisha Tathmini Afya</DialogTitle>
            <DialogDescription>
              Fuata hatua hizi kusakinisha app moja kwa moja kwenye simu yako.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm text-foreground">
            {platform === "ios" && (
              <div className="rounded-xl border bg-muted/40 p-3">
                <h3 className="font-semibold flex items-center gap-2"><Share className="h-4 w-4" /> iPhone / iPad (Safari)</h3>
                <ol className="mt-2 ml-4 list-decimal space-y-1 text-muted-foreground">
                  <li>Fungua ukurasa huu kwenye <strong>Safari</strong> (sio Chrome).</li>
                  <li>Bonyeza ikoni ya <strong>Share</strong> chini ya skrini.</li>
                  <li>Chagua <strong>Add to Home Screen</strong>.</li>
                  <li>Bonyeza <strong>Add</strong> kuthibitisha.</li>
                </ol>
              </div>
            )}

            {platform === "android" && (
              <div className="rounded-xl border bg-muted/40 p-3">
                <h3 className="font-semibold flex items-center gap-2"><MoreVertical className="h-4 w-4" /> Android (Chrome)</h3>
                <ol className="mt-2 ml-4 list-decimal space-y-1 text-muted-foreground">
                  <li>Bonyeza menyu (vinukta vitatu) juu kulia.</li>
                  <li>Chagua <strong>Install app</strong> au <strong>Add to Home screen</strong>.</li>
                  <li>Thibitisha kwa kubonyeza <strong>Install</strong>.</li>
                </ol>
                <p className="mt-2 text-xs text-muted-foreground">
                  Kama huoni Install, fungua ukurasa kwa Chrome (sio in-app browser kama Facebook/Instagram).
                </p>
              </div>
            )}

            {(platform === "desktop" || platform === "other") && (
              <div className="rounded-xl border bg-muted/40 p-3">
                <h3 className="font-semibold">Desktop (Chrome / Edge)</h3>
                <ol className="mt-2 ml-4 list-decimal space-y-1 text-muted-foreground">
                  <li>Tafuta ikoni ya install kwenye address bar.</li>
                  <li>Au fungua menyu &gt; <strong>Install app</strong>.</li>
                </ol>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Funga</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
