import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = "patient" | "doctor" | "admin";

export type AuthTransition = "sign-in" | "sign-out" | null;

interface AuthContext {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  profile: { full_name: string; avatar_url: string | null; phone: string | null } | null;
  loading: boolean;
  transition: AuthTransition;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthContext>({
  user: null, session: null, roles: [], profile: null, loading: true, transition: null, signOut: async () => {},
});

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [profile, setProfile] = useState<AuthContext["profile"]>(null);
  const [loading, setLoading] = useState(true);
  const [transition, setTransition] = useState<AuthTransition>(null);
  const prevUserIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);
  const transitionTimerRef = useRef<number | null>(null);

  const clearTransitionLater = (ms: number) => {
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = window.setTimeout(() => setTransition(null), ms);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user?.id ?? null;
      const prevUserId = prevUserIdRef.current;

      // Trigger sign-in / sign-out celebrations only on actual identity changes,
      // and never on the very first session hydration.
      if (initializedRef.current && prevUserId !== nextUserId) {
        if (!prevUserId && nextUserId) {
          setTransition("sign-in");
          clearTransitionLater(2800);
        } else if (prevUserId && !nextUserId) {
          setTransition("sign-out");
          clearTransitionLater(2000);
        }
      }
      prevUserIdRef.current = nextUserId;

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
      prevUserIdRef.current = session?.user?.id ?? null;
      initializedRef.current = true;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    };
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
    <AuthCtx.Provider value={{ user, session, roles, profile, loading, transition, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

