import { useEffect, useState } from "react";
import { Download } from "lucide-react";
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

export function InstallAppButton({ className }: { className?: string }) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [installed, setInstalled] = useState(false);

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
    if (!installEvent) {
      setInstructionsOpen(true);
      return;
    }

    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
      } else {
        setInstructionsOpen(true);
      }
    } catch (error) {
      console.warn("Install prompt failed", error);
      setInstructionsOpen(true);
    } finally {
      setInstallEvent(null);
    }
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
            <DialogTitle>Install Tathmini Afya</DialogTitle>
            <DialogDescription>
              Your browser does not currently support the install prompt, or it was dismissed. Follow the instructions below to install the app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <h3 className="font-semibold">Android (Chrome / Edge)</h3>
              <p className="mt-1">Open the browser menu, then choose <strong>Add to Home screen</strong> or <strong>Install</strong>.</p>
            </div>
            <div>
              <h3 className="font-semibold">iPhone (Safari)</h3>
              <p className="mt-1">Tap the Share icon, then select <strong>Add to Home Screen</strong>.</p>
            </div>
            <div>
              <h3 className="font-semibold">Desktop Chrome / Edge</h3>
              <p className="mt-1">Use the browser install badge in the address bar or open the menu and choose <strong>Install app</strong>.</p>
            </div>
          </div>
          <DialogFooter className="mt-6 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
