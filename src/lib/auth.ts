import { supabase } from "@/integrations/supabase/client";

export type AccountRole = "admin" | "utility_staff";

export interface SignUpInput {
  fullName: string;
  email: string;
  phone?: string;
  role: AccountRole;
  password: string;
}

export async function signUp(input: SignUpInput) {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const phone = input.phone?.trim() || null;

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      data: {
        full_name: fullName,
        phone,
        role: input.role,
      },
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Sign in failed. Please try again.");
  return data;
}

export async function getCurrentAccountRole(): Promise<AccountRole> {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error("Unable to verify your signed-in account.");
  }

  const { data: roles, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .limit(1);

  if (roleError) throw new Error(roleError.message);

  const role = roles?.[0]?.role;
  return role === "admin" || role === "utility_staff" ? role : "utility_staff";
}

export async function signOut() {
  await supabase.auth.signOut();
}
