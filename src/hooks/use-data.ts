import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type DbPatient = {
  id: string;
  patient_code: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  risk_level: string;
  last_visit: string | null;
  phone: string | null;
  bp: string | null;
  sugar: number | null;
  medicines: string[] | null;
  notes: string | null;
};

export type DbVital = {
  id: string;
  patient_id: string;
  recorded_date: string;
  systolic: number;
  diastolic: number;
  sugar: number;
  adherence: number;
};

export type DbAlert = {
  id: string;
  patient_id: string;
  patient_name: string;
  type: string;
  title: string;
  message: string;
  time: string;
  resolved: boolean;
};

export type DbMedicalHistory = {
  id: string;
  patient_id: string;
  condition: string;
  diagnosis_date: string | null;
  status: string;
  notes: string | null;
};

export type DbAllergy = {
  id: string;
  patient_id: string;
  allergen: string;
  severity: string;
  reaction: string | null;
};

export type DbAppointment = {
  id: string;
  patient_id: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string | null;
  notes: string | null;
  created_at: string;
};

export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*").order("name");
      if (error) throw error;
      return data as DbPatient[];
    },
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ["patients", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as DbPatient;
    },
  });
}

export function usePatientByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: ["patients", "user", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*").eq("user_id", userId!).single();
      
      // If patient record doesn't exist, create one
      if (error?.code === "PGRST116" || error?.message?.includes("No rows found")) {
        const patientCode = "PT-" + String(Math.floor(Math.random() * 99999)).padStart(5, "0");
        const { data: newPatient, error: createError } = await supabase
          .from("patients")
          .insert({
            user_id: userId!,
            patient_code: patientCode,
            name: "Patient",
            age: 0,
            gender: "Male",
          })
          .select("*")
          .single();
        
        if (createError) {
          console.error("Error creating patient record:", createError);
          // Return a minimal patient object so at least the UI doesn't break
          return {
            id: userId!,
            user_id: userId!,
            patient_code: patientCode,
            name: "Patient",
            age: 0,
            gender: "Male",
            condition: "",
            risk_level: "low",
            last_visit: null,
            phone: null,
            bp: null,
            sugar: null,
            medicines: null,
            notes: null,
          } as DbPatient;
        }
        return newPatient as DbPatient;
      }
      
      if (error) {
        console.error("Error fetching patient:", error);
        throw error;
      }
      return data as DbPatient;
    },
    retry: 2, // Retry up to 2 times if there's a transient error
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

export function usePatientVitals(patientId: string | undefined) {
  return useQuery({
    queryKey: ["vitals", patientId],
    enabled: !!patientId,
    queryFn: async () => {
      const { data, error } = await supabase.from("vitals").select("*").eq("patient_id", patientId!).order("recorded_date");
      if (error) throw error;
      return data as DbVital[];
    },
  });
}

export function useAllVitals() {
  return useQuery({
    queryKey: ["vitals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vitals").select("*, patients(name)").order("recorded_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("alerts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbAlert[];
    },
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase.from("alerts").update({ resolved: true }).eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const [patientsRes, highRiskRes, alertsRes] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase.from("patients").select("id", { count: "exact", head: true }).eq("risk_level", "high"),
        supabase.from("alerts").select("id", { count: "exact", head: true }).eq("resolved", false),
      ]);
      return {
        totalPatients: patientsRes.count ?? 0,
        highRisk: highRiskRes.count ?? 0,
        activeAlerts: alertsRes.count ?? 0,
      };
    },
  });
}

export function useMedicalHistory(patientId: string | undefined) {
  return useQuery({
    queryKey: ["medical_history", patientId],
    enabled: !!patientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_history")
        .select("*")
        .eq("patient_id", patientId!)
        .order("diagnosis_date", { ascending: false });
      if (error) throw error;
      return data as DbMedicalHistory[];
    },
  });
}

export function useAddMedicalHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: { patient_id: string; condition: string; diagnosis_date?: string; status?: string; notes?: string }) => {
      const { error } = await supabase.from("medical_history").insert(record);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["medical_history", vars.patient_id] });
    },
  });
}

export function useAllergies(patientId: string | undefined) {
  return useQuery({
    queryKey: ["allergies", patientId],
    enabled: !!patientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("allergies")
        .select("*")
        .eq("patient_id", patientId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbAllergy[];
    },
  });
}

export function useAddAllergy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (allergy: { patient_id: string; allergen: string; severity: string; reaction?: string }) => {
      const { error } = await supabase.from("allergies").insert(allergy);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["allergies", vars.patient_id] });
    },
  });
}

export function useDeleteAllergy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string; patientId: string }) => {
      const { error } = await supabase.from("allergies").delete().eq("id", id);
      if (error) throw error;
      return patientId;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["allergies", vars.patientId] });
    },
  });
}

export function useAppointments(patientId?: string) {
  return useQuery({
    queryKey: ["appointments", patientId],
    queryFn: async () => {
      let q = supabase.from("appointments").select("*").order("appointment_date", { ascending: true });
      if (patientId) q = q.eq("patient_id", patientId);
      const { data, error } = await q;
      if (error) throw error;
      return data as DbAppointment[];
    },
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (appt: {
      patient_id: string;
      doctor_name: string;
      appointment_date: string;
      appointment_time: string;
      reason?: string;
    }) => {
      const { error } = await supabase.from("appointments").insert(appt);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; notes?: string }) => {
      const { error } = await supabase.from("appointments").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

// ===== HEALTH ENTRIES =====

export type DbHealthEntry = {
  id: string;
  patient_id: string;
  user_id: string;
  systolic: number;
  diastolic: number;
  heart_rate: number;
  temperature: number;
  weight: number;
  blood_sugar: number | null;
  recorded_date: string;
  created_at: string;
};

export function useHealthEntries(patientId: string | undefined) {
  return useQuery({
    queryKey: ["health_entries", patientId],
    enabled: !!patientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("health_entries")
        .select("*")
        .eq("patient_id", patientId!)
        .order("recorded_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as DbHealthEntry[];
    },
  });
}

export function useAddHealthEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      patient_id: string;
      user_id: string;
      systolic: number;
      diastolic: number;
      heart_rate: number;
      temperature: number;
      weight: number;
      blood_sugar?: number | null;
      recorded_date?: string;
    }) => {
      const { error } = await (supabase.from("health_entries") as any).insert(entry);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["health_entries", vars.patient_id] });
    },
  });
}
