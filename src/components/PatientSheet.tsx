import { useState } from "react";
import { X, Phone, Pill, AlertTriangle, TrendingUp, History, ShieldAlert, Calendar, Plus, type LucideIcon } from "lucide-react";
import { usePatient, usePatientVitals, useAlerts, useMedicalHistory, useAllergies, useAppointments, useAddMedicalHistory, useAddAllergy, useDeleteAllergy, useCreateAppointment } from "@/hooks/use-data";
import { useI18n } from "@/hooks/useI18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts";
import { translateStatusLabel } from "@/lib/i18n-utils";
import { toast } from "sonner";

const riskColor: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

const severityColor: Record<string, string> = {
  severe: "bg-destructive/10 text-destructive",
  moderate: "bg-warning/10 text-warning",
  mild: "bg-success/10 text-success",
};

type Tab = "overview" | "history" | "allergies" | "appointments";

interface PatientSheetProps {
  patientId: string;
  onClose: () => void;
}

export function PatientSheet({ patientId, onClose }: PatientSheetProps) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("overview");
  const { data: patient, isLoading } = usePatient(patientId);
  const { data: vitals = [] } = usePatientVitals(patientId);
  const { data: allAlerts = [] } = useAlerts();
  const { data: history = [] } = useMedicalHistory(patientId);
  const { data: allergies = [] } = useAllergies(patientId);
  const { data: appointments = [] } = useAppointments(patientId);
  const patientAlerts = allAlerts.filter((a) => a.patient_id === patientId && !a.resolved);

  const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
    { id: "overview", label: t('patientSheet.overview'), icon: TrendingUp },
    { id: "history", label: t('patientSheet.history'), icon: History },
    { id: "allergies", label: t('patientSheet.allergies'), icon: ShieldAlert },
    { id: "appointments", label: t('patientSheet.appointments'), icon: Calendar },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col animate-fade-in">
      <div className="absolute inset-0 backdrop-blur-lg bg-foreground/45 transition-opacity duration-300" onClick={onClose} />
      <div className="relative mt-8 flex-1 bg-gradient-soft rounded-t-3xl overflow-hidden animate-slide-in-bottom flex flex-col shadow-elevated border-t border-white/20">
        {/* Header with glassmorphism */}
        <div className="sticky top-0 z-10 frosted-glass border-b border-white/20 backdrop-blur-md">
          <div className="flex items-center justify-between p-4">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/40 mx-auto absolute left-1/2 -translate-x-1/2 top-3 transition-colors" />
            <span className="text-xs font-medium text-muted-foreground">{t('patientSheet.title')}</span>
            <button onClick={onClose} className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center press-zoom hover-lift transition-all backdrop-blur-sm border border-primary/20 md:hover:border-primary/40">
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Tabs with smooth transitions */}
          <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto no-scrollbar">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all press-zoom duration-300 ${
                  tab === t.id 
                    ? "bg-gradient-primary text-primary-foreground shadow-floating" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted/70 backdrop-blur-sm"
                }`}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl skeleton" />)}
            </div>
          ) : patient ? (
            <div className="px-5 space-y-4 pt-3">
              {/* Patient Header - always visible with animations */}
              <div className="flex items-center gap-3.5 animate-fade-in">
                <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-glow border border-white/20">
                  {patient.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-foreground">{patient.name}</h2>
                    <Badge variant="outline" className={`text-[10px] font-medium ${riskColor[patient.risk_level]}`}>
                      {translateStatusLabel(patient.risk_level, t)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{patient.age}{t('patientSheet.ageSuffix')} • {patient.gender} • {patient.condition}</p>
                  {patient.phone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Phone className="h-3 w-3" /> {patient.phone}
                    </div>
                  )}
                </div>
              </div>

              {tab === "overview" && <OverviewTab patient={patient} vitals={vitals} patientAlerts={patientAlerts} />}
              {tab === "history" && <HistoryTab patientId={patientId} history={history} />}
              {tab === "allergies" && <AllergiesTab patientId={patientId} allergies={allergies} />}
              {tab === "appointments" && <AppointmentsTab patientId={patientId} appointments={appointments} />}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">{t('patientSheet.notFound')}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== OVERVIEW TAB =====
function OverviewTab({ patient, vitals, patientAlerts }: any) {
  const { t } = useI18n();

  return (
    <>
      {/* Vitals Cards with modern styling */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-4 md:hover-lift transition-all shadow-soft md:shadow-sm md:hover:border-primary/40">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{t('records.bp')}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{patient.bp || "—"}</p>
        </div>
        <div className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-4 md:hover-lift transition-all shadow-soft md:shadow-sm md:hover:border-primary/40">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{t('records.sugar')}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{patient.sugar ?? "—"} <span className="text-sm font-normal">mg/dL</span></p>
        </div>
      </div>

      {/* Medicines with modern card styling */}
      {(patient.medicines ?? []).length > 0 && (
        <div className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-4 md:hover-lift transition-all shadow-soft md:shadow-sm md:hover:border-primary/40">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Pill className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{t('patientSheet.medicines')}</h3>
          </div>
          <div className="space-y-2">
            {(patient.medicines ?? []).map((m: string, i: number) => (
              <div key={i} className="text-sm bg-white/30 rounded-xl px-3.5 py-2.5 text-foreground backdrop-blur-sm border border-primary/20 font-medium">{m}</div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts with animation */}
      {patientAlerts.length > 0 && (
        <div className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-4 md:hover-lift transition-all shadow-soft md:shadow-sm md:hover:border-primary/40">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-8 w-8 rounded-lg bg-warning/20 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{t('alerts.title')}</h3>
          </div>
          <div className="space-y-2">
            {patientAlerts.map((a: any, i: number) => (
              <div key={a.id} className="text-xs bg-destructive/10 border border-destructive/20 rounded-xl p-3 scroll-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <p className="font-semibold text-destructive">{a.title}</p>
                <p className="text-muted-foreground mt-1">{a.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vitals Chart with modern styling */}
      {vitals.length > 0 && (
        <div className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-4 md:hover-lift transition-all shadow-soft md:shadow-sm md:hover:border-primary/40">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{t('patientSheet.healthTrends')}</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={vitals}>
              <defs>
                <linearGradient id="bpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0 72% 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0 72% 55%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sugarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(30 95% 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(30 95% 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="recorded_date" tick={{ fontSize: 9 }} stroke="hsl(215 14% 80%)" />
              <YAxis tick={{ fontSize: 9 }} stroke="hsl(215 14% 80%)" />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)" }} />
              <Area type="monotone" dataKey="systolic" stroke="hsl(0 72% 55%)" fill="url(#bpGrad)" strokeWidth={2.5} name={t('health.systolic')} />
              <Area type="monotone" dataKey="sugar" stroke="hsl(30 95% 55%)" fill="url(#sugarGrad)" strokeWidth={2.5} name={t('records.sugar')} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Notes with modern styling */}
      {patient.notes && (
        <div className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-4 md:hover-lift transition-all shadow-soft md:shadow-sm md:hover:border-primary/40">
          <h3 className="text-sm font-semibold text-foreground mb-2">{t('records.notes')}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{patient.notes}</p>
        </div>
      )}
    </>
  );
}

// ===== HISTORY TAB =====
function HistoryTab({ patientId, history }: { patientId: string; history: any[] }) {
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [condition, setCondition] = useState("");
  const [diagDate, setDiagDate] = useState("");
  const [notes, setNotes] = useState("");
  const addHistory = useAddMedicalHistory();

  const handleAdd = async () => {
    if (!condition.trim()) return;
    try {
      await addHistory.mutateAsync({
        patient_id: patientId,
        condition: condition.trim(),
        diagnosis_date: diagDate || undefined,
        notes: notes || undefined,
      });
      setCondition(""); setDiagDate(""); setNotes(""); setShowForm(false);
      toast.success(t('patientSheet.historyAdded'));
    } catch {
      toast.error(t('patientSheet.saveFailed'));
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t('patientSheet.medicalHistory')}</h3>
        <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-3 w-3 mr-1" /> {t('patientSheet.addMedicalHistory')}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-4 space-y-3 animate-scale-in shadow-soft md:shadow-sm md:hover:border-primary/40">
          <Input placeholder={t('patientSheet.conditionPlaceholder')} value={condition} onChange={e => setCondition(e.target.value)} className="h-10 rounded-xl text-sm frosted-glass backdrop-blur-sm border-primary/20" />
          <Input type="date" value={diagDate} onChange={e => setDiagDate(e.target.value)} className="h-10 rounded-xl text-sm frosted-glass backdrop-blur-sm border-primary/20" />
          <Input placeholder={t('patientSheet.notesPlaceholder')} value={notes} onChange={e => setNotes(e.target.value)} className="h-10 rounded-xl text-sm frosted-glass backdrop-blur-sm border-primary/20" />
          <div className="flex gap-2">
            <Button size="sm" className="rounded-xl text-xs flex-1 shadow-soft" onClick={handleAdd} disabled={addHistory.isPending}>{t('common.save')}</Button>
            <Button size="sm" variant="ghost" className="rounded-xl text-xs" onClick={() => setShowForm(false)}>{t('common.cancel')}</Button>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-12 animate-fade-in">
          <div className="h-12 w-12 rounded-full bg-muted/50 mx-auto mb-3 flex items-center justify-center">
            <History className="h-5 w-5 text-muted-foreground/50" />
          </div>
          {t('patientSheet.noHistory')}
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.map((h, i) => (
            <div key={h.id} className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-3.5 md:hover-lift transition-all shadow-soft md:shadow-sm md:hover:border-primary/40 scroll-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{h.condition}</p>
                <Badge variant="outline" className={`text-[10px] font-medium ${h.status === "active" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                  {translateStatusLabel(h.status, t)}
                </Badge>
              </div>
              {h.diagnosis_date && <p className="text-[10px] text-muted-foreground mt-2">{t('patientSheet.diagnosedOn')}: {h.diagnosis_date}</p>}
              {h.notes && <p className="text-xs text-muted-foreground mt-1">{h.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ===== ALLERGIES TAB =====
function AllergiesTab({ patientId, allergies }: { patientId: string; allergies: any[] }) {
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [allergen, setAllergen] = useState("");
  const [severity, setSeverity] = useState("mild");
  const [reaction, setReaction] = useState("");
  const addAllergy = useAddAllergy();
  const deleteAllergy = useDeleteAllergy();

  const handleAdd = async () => {
    if (!allergen.trim()) return;
    try {
      await addAllergy.mutateAsync({ patient_id: patientId, allergen: allergen.trim(), severity, reaction: reaction || undefined });
      setAllergen(""); setReaction(""); setShowForm(false);
      toast.success(t('patientSheet.allergyAdded'));
    } catch {
      toast.error(t('patientSheet.saveFailed'));
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t('patientSheet.allergies')}</h3>
        <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-3 w-3 mr-1" /> {t('patientSheet.addAllergy')}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-4 space-y-3 animate-scale-in shadow-soft md:shadow-sm md:hover:border-primary/40">
          <Input placeholder={t('patientSheet.allergenPlaceholder')} value={allergen} onChange={e => setAllergen(e.target.value)} className="h-10 rounded-xl text-sm frosted-glass backdrop-blur-sm border-primary/20" />
          <div className="flex gap-2">
            {["mild", "moderate", "severe"].map(s => (
              <button key={s} onClick={() => setSeverity(s)}
                className={`flex-1 px-2 py-2 rounded-xl text-xs font-medium transition-all press-zoom ${severity === s ? "bg-gradient-primary text-primary-foreground shadow-floating" : "bg-muted/50 text-muted-foreground hover:bg-muted/70 backdrop-blur-sm"}`}
              >{translateStatusLabel(s, t)}</button>
            ))}
          </div>
          <Input placeholder={t('patientSheet.reactionPlaceholder')} value={reaction} onChange={e => setReaction(e.target.value)} className="h-10 rounded-xl text-sm frosted-glass backdrop-blur-sm border-primary/20" />
          <div className="flex gap-2">
            <Button size="sm" className="rounded-xl text-xs flex-1 shadow-soft" onClick={handleAdd} disabled={addAllergy.isPending}>{t('common.save')}</Button>
            <Button size="sm" variant="ghost" className="rounded-xl text-xs" onClick={() => setShowForm(false)}>{t('common.cancel')}</Button>
          </div>
        </div>
      )}
      {allergies.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-12 animate-fade-in">
          <div className="h-12 w-12 rounded-full bg-muted/50 mx-auto mb-3 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-muted-foreground/50" />
          </div>
          {t('patientSheet.noAllergies')}
        </div>
      ) : (
        <div className="space-y-2.5">
          {allergies.map((a, i) => (
            <div key={a.id} className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-3.5 flex items-center justify-between md:hover-lift transition-all shadow-soft md:shadow-sm md:hover:border-primary/40 scroll-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">{a.allergen}</p>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${severityColor[a.severity] || ""}`}>{translateStatusLabel(a.severity, t)}</span>
                </div>
                {a.reaction && <p className="text-xs text-muted-foreground mt-1.5">{a.reaction}</p>}
              </div>
              <button
                onClick={() => deleteAllergy.mutate({ id: a.id, patientId })}
                className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all ml-2 shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ===== APPOINTMENTS TAB =====
function AppointmentsTab({ patientId, appointments }: { patientId: string; appointments: any[] }) {
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [reason, setReason] = useState("");
  const createAppt = useCreateAppointment();

  const handleCreate = async () => {
    if (!date) return;
    try {
      await createAppt.mutateAsync({
        patient_id: patientId,
        doctor_name: doctorName || t('patientSheet.doctorFallback'),
        appointment_date: date,
        appointment_time: time,
        reason: reason || undefined,
      });
      setDoctorName(""); setDate(""); setReason(""); setShowForm(false);
      toast.success(t('patientSheet.appointmentCreated'));
    } catch {
      toast.error(t('patientSheet.appointmentFailed'));
    }
  };

  const statusColor: Record<string, string> = {
    scheduled: "bg-primary/10 text-primary",
    completed: "bg-success/10 text-success",
    cancelled: "bg-muted text-muted-foreground",
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t('patientSheet.appointments')}</h3>
        <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-3 w-3 mr-1" /> {t('patientSheet.requestAppointment')}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-4 space-y-3 animate-scale-in shadow-soft md:shadow-sm md:hover:border-primary/40">
          <Input placeholder={t('patientSheet.doctorName')} value={doctorName} onChange={e => setDoctorName(e.target.value)} className="h-10 rounded-xl text-sm frosted-glass backdrop-blur-sm border-primary/20" />
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-10 rounded-xl text-sm frosted-glass backdrop-blur-sm border-primary/20" />
            <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="h-10 rounded-xl text-sm frosted-glass backdrop-blur-sm border-primary/20" />
          </div>
          <Input placeholder={t('patientSheet.reasonPlaceholder')} value={reason} onChange={e => setReason(e.target.value)} className="h-10 rounded-xl text-sm frosted-glass backdrop-blur-sm border-primary/20" />
          <div className="flex gap-2">
            <Button size="sm" className="rounded-xl text-xs flex-1 shadow-soft" onClick={handleCreate} disabled={createAppt.isPending}>{t('common.save')}</Button>
            <Button size="sm" variant="ghost" className="rounded-xl text-xs" onClick={() => setShowForm(false)}>{t('common.cancel')}</Button>
          </div>
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-12 animate-fade-in">
          <div className="h-12 w-12 rounded-full bg-muted/50 mx-auto mb-3 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-muted-foreground/50" />
          </div>
          {t('patientSheet.noAppointments')}
        </div>
      ) : (
        <div className="space-y-2.5">
          {appointments.map((a, i) => (
            <div key={a.id} className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-3.5 md:hover-lift transition-all shadow-soft md:shadow-sm md:hover:border-primary/40 scroll-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{a.doctor_name || t('patientSheet.doctorFallback')}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.appointment_date} • {a.appointment_time}</p>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium shrink-0 ${statusColor[a.status] || ""}`}>{translateStatusLabel(a.status, t)}</span>
              </div>
              {a.reason && <p className="text-xs text-muted-foreground mt-2">{a.reason}</p>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
