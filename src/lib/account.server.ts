import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AccountRole = "admin" | "utility_staff";

export interface RegisterAccountInput {
  fullName: string;
  email: string;
  phone?: string;
  role: AccountRole;
  password: string;
}

export interface VerifiedAccountInput {
  userId: string;
  email: string;
  metadata: Record<string, unknown>;
  fallbackRole: AccountRole;
}

export async function createConfirmedAccount(data: RegisterAccountInput) {
  const phone = data.phone || null;

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.fullName,
      phone,
      role: data.role,
    },
  });

  if (createError) {
    throw new Error(createError.message);
  }

  const user = created.user;
  if (!user) {
    throw new Error("Account could not be created. Please try again.");
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    {
      id: user.id,
      full_name: data.fullName,
      email: data.email,
      phone,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    throw new Error(profileError.message);
  }

  const { data: existingRoles, error: roleLookupError } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (roleLookupError) {
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    throw new Error(roleLookupError.message);
  }

  if (!existingRoles?.length) {
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: user.id,
      role: data.role,
    });

    if (roleError) {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      throw new Error(roleError.message);
    }
  }
}

export async function ensureAccountRecords(data: VerifiedAccountInput) {
  const fullName =
    typeof data.metadata.full_name === "string" && data.metadata.full_name.trim()
      ? data.metadata.full_name.trim()
      : data.email;
  const phone =
    typeof data.metadata.phone === "string" && data.metadata.phone.trim()
      ? data.metadata.phone.trim()
      : null;

  const { data: profile, error: profileLookupError } = await supabaseAdmin
    .from("profiles")
    .select("full_name,email,phone")
    .eq("id", data.userId)
    .maybeSingle();

  if (profileLookupError) {
    throw new Error(profileLookupError.message);
  }

  const currentProfile = profile ?? {
    full_name: fullName,
    email: data.email,
    phone,
  };

  if (!profile) {
    const { error: profileCreateError } = await supabaseAdmin.from("profiles").insert({
      id: data.userId,
      ...currentProfile,
    });

    if (profileCreateError) {
      throw new Error(profileCreateError.message);
    }
  }

  const { data: roles, error: rolesError } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.userId)
    .limit(1);

  if (rolesError) {
    throw new Error(rolesError.message);
  }

  let role = roles?.[0]?.role as AccountRole | undefined;

  if (!role) {
    const { error: roleCreateError } = await supabaseAdmin.from("user_roles").insert({
      user_id: data.userId,
      role: data.fallbackRole,
    });

    if (roleCreateError) {
      throw new Error(roleCreateError.message);
    }

    role = data.fallbackRole;
  }

  return { role, profile: currentProfile };
}