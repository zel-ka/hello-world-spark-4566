import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { HeroSection } from "@/components/sections/HeroSection";
import { PatientsSection } from "@/components/sections/PatientsSection";
import { AlertsSection } from "@/components/sections/AlertsSection";
import { TrendsSection } from "@/components/sections/TrendsSection";
import { RecordsSection } from "@/components/sections/RecordsSection";
import { SettingsSection } from "@/components/sections/SettingsSection";
import { PatientSheet } from "@/components/PatientSheet";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/useI18n";
import { X, Stethoscope, Shield, LogOut } from "lucide-react";

type OverlaySection = "patients" | "records" | "alerts" | "settings" | null;

export default function Index() {
  const { profile, roles, signOut } = useAuth();
  const { t } = useI18n();
  
  const [overlay, setOverlay] = useState<OverlaySection>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const observe = useScrollAnimation();
  const mainRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const isDoctor = roles.includes("doctor");
  const isAdmin = roles.includes("admin");

  const overlayTitles: Record<string, string> = {
    patients: t('overlay.patients'),
    records: t('overlay.records'),
    alerts: t('overlay.alerts'),
    settings: t('overlay.settings'),
  };

  // Observe scroll animations on main content
  useEffect(() => {
    observe(mainRef.current);
  }, [observe]);

  // Observe scroll animations when overlay opens
  useEffect(() => {
    if (overlay) {
      const timer = setTimeout(() => observe(overlayRef.current), 50);
      return () => clearTimeout(timer);
    }
  }, [overlay, observe]);

  const handleNavigate = useCallback((section: string) => {
    if (section === "dashboard") {
      setOverlay(null);
    } else {
      setOverlay(section as OverlaySection);
    }
  }, []);

  const handleSelectPatient = useCallback((id: string) => {
    setSelectedPatientId(id);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Main scrollable dashboard - always rendered */}
      <div ref={mainRef} className="flex-1 overflow-y-auto no-scrollbar pb-24 safe-area-bottom">
        
        {/* Header for Doctor/Admin - Minimal, just shows role and logout */}
        {(isDoctor || isAdmin) && (
          <div className="bg-card border-b border-border px-5 pt-8 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {isAdmin ? <Shield className="h-5 w-5 text-primary" /> : <Stethoscope className="h-5 w-5 text-primary" />}
                </div>
              <div>
                <p className="text-sm text-muted-foreground">{isAdmin ? t('dashboard.adminPanel') : t('dashboard.welcomeDoctor')}</p>
                <h1 className="text-lg font-bold text-foreground">{profile?.full_name || (isAdmin ? t('dashboard.adminPanel') : t('dashboard.doctor'))}</h1>
              </div>
              </div>
              <Button variant="ghost" size="icon" onClick={signOut} className="hover-lift">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Original Dashboard Content - All effects preserved */}
        <HeroSection />
        <PatientsSection onSelectPatient={handleSelectPatient} />
        <AlertsSection onViewPatient={handleSelectPatient} limit={3} />
        <TrendsSection />
      </div>

      {/* Overlay sections - slide up from bottom with modern effects */}
      {overlay && (
        <div className="fixed inset-0 z-40 flex flex-col animate-fade-in">
          {/* Backdrop with glassmorphism */}
          <div
            className="absolute inset-0 backdrop-blur-lg bg-foreground/40 transition-opacity duration-300 animate-fade-in"
            onClick={() => setOverlay(null)}
          />

          {/* Overlay panel with modern styling */}
          <div className="relative mt-12 flex-1 bg-gradient-soft rounded-t-3xl overflow-hidden animate-slide-in-bottom flex flex-col shadow-elevated border-t border-white/20">
            {/* Header with glassmorphism */}
            <div className="sticky top-0 z-10 frosted-glass border-b border-white/20 backdrop-blur-md">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3 transition-colors" />
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-lg font-bold text-foreground">
                  {overlayTitles[overlay] || ""}
                </h2>
                <button
                  onClick={() => setOverlay(null)}
                  className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center press-zoom hover-lift transition-all backdrop-blur-sm border border-white/20"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Overlay content */}
            <div ref={overlayRef} className="flex-1 overflow-y-auto no-scrollbar pb-safe">
              {overlay === "patients" && (
                <PatientsSection onSelectPatient={handleSelectPatient} />
              )}
              {overlay === "records" && <RecordsSection />}
              {overlay === "alerts" && (
                <AlertsSection onViewPatient={handleSelectPatient} />
              )}
              {overlay === "settings" && <SettingsSection />}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav
        active={overlay || "dashboard"}
        onNavigate={handleNavigate}
      />

      {/* Patient Detail Sheet */}
      {selectedPatientId && (
        <PatientSheet
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
        />
      )}
    </div>
  );
}
