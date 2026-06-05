import { supabase } from "@/integrations/supabase/client";

export type AccountRole = "admin" | "utility_staff";

export interface SignUpInput {
  fullName: string;
  email: string;
  phone?: string;
  role: AccountRole;
  password: string;
}

function parseRole(value: unknown): AccountRole {
  return value === "admin" || value === "utility_staff" ? value : "utility_staff";
}

async function ensureCurrentAccountRecords(fallbackRole?: AccountRole) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error("Unable to verify your signed-in account.");
  }

  const user = userData.user;
  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string" && metadata.full_name.trim()
      ? metadata.full_name.trim()
      : (user.email ?? "User");
  const phone = typeof metadata.phone === "string" && metadata.phone.trim() ? metadata.phone.trim() : null;
  const role = fallbackRole ?? parseRole(metadata.role);

  const { data: profile, error: profileLookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileLookupError) throw new Error(profileLookupError.message);

  if (!profile) {
    const { error: profileCreateError } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: fullName,
      email: user.email ?? "",
      phone,
    });

    if (profileCreateError) throw new Error(profileCreateError.message);
  }

  const { data: roles, error: roleLookupError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .limit(1);

  if (roleLookupError) throw new Error(roleLookupError.message);

  if (!roles?.length) {
    const { error: roleCreateError } = await supabase.from("user_roles").insert({
      user_id: user.id,
      role,
    });

    if (roleCreateError) throw new Error(roleCreateError.message);
  }
}

export async function getSignedInAccountRole(): Promise<AccountRole | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return null;

  await ensureCurrentAccountRecords();

  const { data: roles, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .limit(1);

  if (roleError) throw new Error(roleError.message);

  return parseRole(roles?.[0]?.role);
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

  if (error) {
    const message = error.message.toLowerCase().includes("already")
      ? "This email already has an account. Please sign in instead."
      : error.message;
    throw new Error(message);
  }
  if (data.session) await ensureCurrentAccountRecords(input.role);
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
  const role = await getSignedInAccountRole();

  if (!role) {
    throw new Error("Unable to verify your signed-in account.");
  }

  return role;
}

export async function signOut() {
  await supabase.auth.signOut();
}
