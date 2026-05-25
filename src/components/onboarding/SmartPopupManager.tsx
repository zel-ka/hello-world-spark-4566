import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/useI18n";
import { useAlerts, usePatients } from "@/hooks/use-data";
import { type DbHealthEntry } from "@/hooks/use-data";
import { SmartPopup, type PopupVariant } from "@/components/onboarding/SmartPopup";

const STORAGE_PREFIX = "smart-popup";

type PopupContext = "guest-dashboard" | "patient-dashboard" | "doctor-dashboard";

type PopupCandidate = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  variant: PopupVariant;
  priority: number;
  action: () => void;
  laterAction?: () => void;
  condition: boolean;
};

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getStorageKey(context: PopupContext, userId: string | null, popupId: string, suffix: string) {
  const owner = userId ? `${userId}` : "guest";
  return `${STORAGE_PREFIX}.${context}.${owner}.${popupId}.${suffix}`;
}

function readStorage(context: PopupContext, userId: string | null, popupId: string, suffix: string) {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(getStorageKey(context, userId, popupId, suffix));
}

function writeStorage(context: PopupContext, userId: string | null, popupId: string, suffix: string, value: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(getStorageKey(context, userId, popupId, suffix), value);
}

function getLaterTimestamp(context: PopupContext, userId: string | null, popupId: string) {
  const value = readStorage(context, userId, popupId, "laterUntil");
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

interface SmartPopupManagerProps {
  context: PopupContext;
  userId?: string;
  profile?: { full_name: string; avatar_url: string | null; phone: string | null } | null;
  healthEntries?: DbHealthEntry[];
  todayLogMissing?: boolean;
  hasAbnormalVitals?: boolean;
  onOpenQuickLog?: () => void;
}

export function SmartPopupManager({
  context,
  userId,
  profile,
  healthEntries = [],
  todayLogMissing = false,
  hasAbnormalVitals = false,
  onOpenQuickLog,
}: SmartPopupManagerProps) {
  const { t } = useI18n();
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedPopup, setSelectedPopup] = useState<PopupCandidate | null>(null);
  const [mounted, setMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentUserId = userId ?? user?.id ?? null;

  const isProfileIncomplete = Boolean(!profile || !profile.full_name?.trim() || !profile.phone?.trim());
  const hasHealthEntries = healthEntries.length > 0;
  const isDoctor = roles.includes("doctor");
  const isAdmin = roles.includes("admin");
  const { data: alerts = [] } = useAlerts();
  const { data: patients = [] } = usePatients();

  const patientWelcome = useMemo(() => {
    const popupId = "patient-welcome";
    const dismissed = readStorage(context, currentUserId, popupId, "dismissed") === "1";
    const laterUntil = getLaterTimestamp(context, currentUserId, popupId);
    const shouldShow = !!currentUserId && !dismissed && Date.now() > laterUntil;

    return {
      id: popupId,
      title: t("popups.welcomeTitle"),
      description: t("popups.welcomeDesc"),
      ctaLabel: t("popups.welcomeAction"),
      variant: "success" as PopupVariant,
      priority: 110,
      condition: shouldShow && context === "patient-dashboard" && !readStorage(context, currentUserId, popupId, "shown"),
      action: () => {
        if (onOpenQuickLog) onOpenQuickLog();
        writeStorage(context, currentUserId, popupId, "dismissed", "1");
        writeStorage(context, currentUserId, popupId, "shown", "1");
        setRefreshKey((current) => current + 1);
      },
      laterAction: () => {
        writeStorage(context, currentUserId, popupId, "laterUntil", String(Date.now() + 1000 * 60 * 60 * 24));
        setRefreshKey((current) => current + 1);
      },
    };
  }, [context, currentUserId, onOpenQuickLog, t, refreshKey]);

  const profileReminder = useMemo(() => {
    const popupId = "profile-reminder";
    const dismissed = readStorage(context, currentUserId, popupId, "dismissed") === "1";
    const laterUntil = getLaterTimestamp(context, currentUserId, popupId);
    return {
      id: popupId,
      title: t("popups.profileTitle"),
      description: t("popups.profileDesc"),
      ctaLabel: t("popups.profileAction"),
      variant: "info" as PopupVariant,
      priority: 105,
      condition: shouldShowPopup(dismissed, laterUntil) && context === "patient-dashboard" && isProfileIncomplete,
      action: () => {
        writeStorage(context, currentUserId, popupId, "dismissed", "1");
        setRefreshKey((current) => current + 1);
      },
      laterAction: () => {
        writeStorage(context, currentUserId, popupId, "laterUntil", String(Date.now() + 1000 * 60 * 60 * 6));
        setRefreshKey((current) => current + 1);
      },
    };
  }, [context, currentUserId, isProfileIncomplete, t, refreshKey]);

  const firstVitalsReminder = useMemo(() => {
    const popupId = "first-vitals";
    const dismissed = readStorage(context, currentUserId, popupId, "dismissed") === "1";
    const laterUntil = getLaterTimestamp(context, currentUserId, popupId);
    return {
      id: popupId,
      title: t("popups.firstVitalsTitle"),
      description: t("popups.firstVitalsDesc"),
      ctaLabel: t("popups.firstVitalsAction"),
      variant: "feature" as PopupVariant,
      priority: 100,
      condition: shouldShowPopup(dismissed, laterUntil) && context === "patient-dashboard" && !hasHealthEntries,
      action: () => {
        if (onOpenQuickLog) onOpenQuickLog();
        writeStorage(context, currentUserId, popupId, "dismissed", "1");
        setRefreshKey((current) => current + 1);
      },
      laterAction: () => {
        writeStorage(context, currentUserId, popupId, "laterUntil", String(Date.now() + 1000 * 60 * 60 * 24));
        setRefreshKey((current) => current + 1);
      },
    };
  }, [context, currentUserId, hasHealthEntries, onOpenQuickLog, t, refreshKey]);

  const dailyLogReminder = useMemo(() => {
    const popupId = "daily-log";
    const dismissed = readStorage(context, currentUserId, popupId, "dismissed") === "1";
    const laterUntil = getLaterTimestamp(context, currentUserId, popupId);
    return {
      id: popupId,
      title: t("popups.dailyLogTitle"),
      description: t("popups.dailyLogDesc"),
      ctaLabel: t("popups.dailyLogAction"),
      variant: "info" as PopupVariant,
      priority: 98,
      condition: shouldShowPopup(dismissed, laterUntil) && context === "patient-dashboard" && todayLogMissing,
      action: () => {
        if (onOpenQuickLog) onOpenQuickLog();
        writeStorage(context, currentUserId, popupId, "dismissed", "1");
        setRefreshKey((current) => current + 1);
      },
      laterAction: () => {
        writeStorage(context, currentUserId, popupId, "laterUntil", String(Date.now() + 1000 * 60 * 60 * 8));
        setRefreshKey((current) => current + 1);
      },
    };
  }, [context, currentUserId, todayLogMissing, onOpenQuickLog, t, refreshKey]);

  const abnormalReadingReminder = useMemo(() => {
    const popupId = "abnormal-vitals";
    const dismissed = readStorage(context, currentUserId, popupId, "dismissed") === "1";
    const laterUntil = getLaterTimestamp(context, currentUserId, popupId);
    return {
      id: popupId,
      title: t("popups.abnormalTitle"),
      description: t("popups.abnormalDesc"),
      ctaLabel: t("popups.abnormalAction"),
      variant: "warning" as PopupVariant,
      priority: 99,
      condition: shouldShowPopup(dismissed, laterUntil) && context === "patient-dashboard" && hasAbnormalVitals,
      action: () => {
        writeStorage(context, currentUserId, popupId, "dismissed", "1");
        setRefreshKey((current) => current + 1);
      },
      laterAction: () => {
        writeStorage(context, currentUserId, popupId, "laterUntil", String(Date.now() + 1000 * 60 * 60 * 12));
        setRefreshKey((current) => current + 1);
      },
    };
  }, [context, currentUserId, hasAbnormalVitals, t, refreshKey]);

  const doctorAlertsReminder = useMemo(() => {
    const popupId = "doctor-alerts";
    const dismissed = readStorage(context, currentUserId, popupId, "dismissed") === "1";
    const laterUntil = getLaterTimestamp(context, currentUserId, popupId);
    return {
      id: popupId,
      title: t("popups.doctorAlertsTitle"),
      description: t("popups.doctorAlertsDesc"),
      ctaLabel: t("popups.doctorAlertsAction"),
      variant: "warning" as PopupVariant,
      priority: 105,
      condition: shouldShowPopup(dismissed, laterUntil) && context === "doctor-dashboard" && alerts.length > 0,
      action: () => {
        writeStorage(context, currentUserId, popupId, "dismissed", "1");
        setRefreshKey((current) => current + 1);
      },
      laterAction: () => {
        writeStorage(context, currentUserId, popupId, "laterUntil", String(Date.now() + 1000 * 60 * 60 * 6));
        setRefreshKey((current) => current + 1);
      },
    };
  }, [context, currentUserId, alerts.length, t, refreshKey]);

  const doctorPatientsReminder = useMemo(() => {
    const popupId = "doctor-patients";
    const dismissed = readStorage(context, currentUserId, popupId, "dismissed") === "1";
    const laterUntil = getLaterTimestamp(context, currentUserId, popupId);
    return {
      id: popupId,
      title: t("popups.doctorPatientsTitle"),
      description: t("popups.doctorPatientsDesc"),
      ctaLabel: t("popups.doctorPatientsAction"),
      variant: "feature" as PopupVariant,
      priority: 100,
      condition: shouldShowPopup(dismissed, laterUntil) && context === "doctor-dashboard" && patients.length === 0,
      action: () => {
        writeStorage(context, currentUserId, popupId, "dismissed", "1");
        setRefreshKey((current) => current + 1);
      },
      laterAction: () => {
        writeStorage(context, currentUserId, popupId, "laterUntil", String(Date.now() + 1000 * 60 * 60 * 12));
        setRefreshKey((current) => current + 1);
      },
    };
  }, [context, currentUserId, patients.length, t, refreshKey]);

  const guestSignupReminder = useMemo(() => {
    const popupId = "guest-signup";
    const dismissed = readStorage(context, currentUserId, popupId, "dismissed") === "1";
    const laterUntil = getLaterTimestamp(context, currentUserId, popupId);
    return {
      id: popupId,
      title: t("popups.guestTitle"),
      description: t("popups.guestDesc"),
      ctaLabel: t("popups.guestAction"),
      variant: "feature" as PopupVariant,
      priority: 100,
      condition: shouldShowPopup(dismissed, laterUntil) && context === "guest-dashboard",
      action: () => {
        navigate("/");
        writeStorage(context, currentUserId, popupId, "dismissed", "1");
        setRefreshKey((current) => current + 1);
      },
      laterAction: () => {
        writeStorage(context, currentUserId, popupId, "laterUntil", String(Date.now() + 1000 * 60 * 60 * 24));
        setRefreshKey((current) => current + 1);
      },
    };
  }, [context, currentUserId, navigate, t, refreshKey]);

  const allCandidates = useMemo(() => {
    const list: PopupCandidate[] = [];
    if (context === "patient-dashboard") {
      list.push(patientWelcome, profileReminder, firstVitalsReminder, abnormalReadingReminder, dailyLogReminder);
    }
    if (context === "doctor-dashboard") {
      if (isDoctor || isAdmin) {
        list.push(doctorAlertsReminder, doctorPatientsReminder);
      }
    }
    if (context === "guest-dashboard") {
      list.push(guestSignupReminder);
    }
    return list
      .filter((item) => item.condition)
      .sort((a, b) => b.priority - a.priority);
  }, [context, patientWelcome, profileReminder, firstVitalsReminder, abnormalReadingReminder, dailyLogReminder, doctorAlertsReminder, doctorPatientsReminder, guestSignupReminder, isAdmin, isDoctor]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (allCandidates.length > 0) {
      setSelectedPopup(allCandidates[0]);
      const timer = window.setTimeout(() => setOpen(true), 650);
      return () => window.clearTimeout(timer);
    }
    setOpen(false);
    setSelectedPopup(null);
  }, [allCandidates, mounted]);

  const handleClose = () => {
    if (!selectedPopup) {
      setOpen(false);
      return;
    }
    writeStorage(context, currentUserId, selectedPopup.id, "dismissed", "1");
    setOpen(false);
    setRefreshKey((current) => current + 1);
  };

  if (!mounted || !selectedPopup) {
    return null;
  }

  return (
    <SmartPopup
      open={open}
      title={selectedPopup.title}
      description={selectedPopup.description}
      variant={selectedPopup.variant}
      ctaLabel={selectedPopup.ctaLabel}
      actionLabel={selectedPopup.ctaLabel}
      laterLabel={t("popups.later")}
      onAction={() => {
        selectedPopup.action();
        setOpen(false);
      }}
      onLater={() => {
        selectedPopup.laterAction?.();
        setOpen(false);
      }}
      onClose={handleClose}
    />
  );
}

function shouldShowPopup(dismissed: boolean, laterUntil: number) {
  return !dismissed && Date.now() > laterUntil;
}
