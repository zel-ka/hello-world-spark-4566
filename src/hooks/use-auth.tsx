import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = "patient" | "doctor" | "admin";

interface AuthContext {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  profile: { full_name: string; avatar_url: string | null; phone: string | null } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthContext>({
  user: null, session: null, roles: [], profile: null, loading: true, signOut: async () => {},
});

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [profile, setProfile] = useState<AuthContext["profile"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchUserData(session.user.id), 0);
      } else {
        setRoles([]);
        setProfile(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserData(userId: string) {
    try {
      const [rolesRes, profileRes] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("profiles").select("full_name, avatar_url, phone").eq("user_id", userId).maybeSingle(),
      ]);
      if (rolesRes.error) throw rolesRes.error;
      type UserRoleRow = Database["public"]["Tables"]["user_roles"]["Row"];
      const userRoles = (rolesRes.data ?? []).map((r: UserRoleRow) => r.role);
      setRoles(userRoles);
      
      // If no profile exists yet (just created), that's okay
      if (profileRes.data) {
        setProfile(profileRes.data as AuthContext["profile"]);
      } else {
        setProfile(null);
      }
    } catch (err: any) {
      // If profile doesn't exist yet, continue (user just created)
      if (err?.code !== "PGRST116") {
        if (err?.message?.includes("JWT expired") || err?.code === "PGRST303") {
          await supabase.auth.signOut();
        }
        console.error("Error fetching user data:", err);
      }
    }
    setLoading(false);
  }

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthCtx.Provider value={{ user, session, roles, profile, loading, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}
