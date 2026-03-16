import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: "admin" | "owner" | null;
  approved: boolean;
  profile: { full_name: string; company_name: string | null; phone: string | null; email: string | null } | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, loading: true, role: null, approved: false, profile: null, signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"admin" | "owner" | null>(null);
  const [approved, setApproved] = useState(false);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);

  const fetchUserData = async (userId: string) => {
    const [rolesRes, profileRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("profiles").select("*").eq("id", userId).single(),
    ]);

    if (rolesRes.data && rolesRes.data.length > 0) {
      const roles = rolesRes.data.map((r: any) => r.role);
      setRole(roles.includes("admin") ? "admin" : roles.includes("owner") ? "owner" : null);
    } else {
      setRole(null);
    }

    if (profileRes.data) {
      setApproved(profileRes.data.approved || false);
      setProfile({
        full_name: profileRes.data.full_name,
        company_name: profileRes.data.company_name,
        phone: profileRes.data.phone,
        email: profileRes.data.email,
      });
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchUserData(session.user.id), 0);
      } else {
        setRole(null);
        setApproved(false);
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setApproved(false);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, role, approved, profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
