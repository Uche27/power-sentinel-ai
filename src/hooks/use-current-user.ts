import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole = "admin" | "utility_staff";

export interface CurrentUser {
  user: User | null;
  role: AppRole | null;
  profile: { full_name: string; email: string; phone: string | null } | null;
  loading: boolean;
  refresh: () => void;
}

export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<CurrentUser["profile"]>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (uid: string) => {
    const [{ data: roles }, { data: prof }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("profiles").select("full_name,email,phone").eq("id", uid).maybeSingle(),
    ]);
    setRole((roles?.[0]?.role as AppRole) ?? "utility_staff");
    setProfile(prof ?? null);
    setLoading(false);
  }, []);

  const refresh = useCallback(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) load(data.user.id);
    });
  }, [load]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true);
        load(session.user.id);
      } else {
        setRole(null);
        setProfile(null);
        setLoading(false);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) load(data.session.user.id);
      else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [load]);

  return { user, role, profile, loading, refresh };
}
