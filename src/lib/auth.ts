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
  await ensureCurrentAccountRecords();

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
  return parseRole(role);
}

export async function signOut() {
  await supabase.auth.signOut();
}
