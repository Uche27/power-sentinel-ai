import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const RoleSchema = z.enum(["admin", "utility_staff"]);

const RegisterAccountSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(30).optional().default(""),
  role: RoleSchema,
  password: z.string().min(8).max(72),
});

export const registerAccount = createServerFn({ method: "POST" })
  .inputValidator((input) => RegisterAccountSchema.parse(input))
  .handler(async ({ data }) => {
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

    return { ok: true, role: data.role };
  });

export const getOrCreateCurrentAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      throw new Error("Unable to verify your signed-in account.");
    }

    const metadata = authData.user.user_metadata ?? {};
    const metadataRole = RoleSchema.safeParse(metadata.role).success ? (metadata.role as "admin" | "utility_staff") : "utility_staff";
    const fullName = typeof metadata.full_name === "string" && metadata.full_name.trim() ? metadata.full_name.trim() : authData.user.email ?? "User";
    const phone = typeof metadata.phone === "string" && metadata.phone.trim() ? metadata.phone.trim() : null;

    const { data: profile, error: profileLookupError } = await supabaseAdmin
      .from("profiles")
      .select("full_name,email,phone")
      .eq("id", userId)
      .maybeSingle();

    if (profileLookupError) {
      throw new Error(profileLookupError.message);
    }

    const currentProfile = profile ?? {
      full_name: fullName,
      email: authData.user.email ?? "",
      phone,
    };

    if (!profile) {
      const { error: profileCreateError } = await supabaseAdmin.from("profiles").insert({
        id: userId,
        ...currentProfile,
      });

      if (profileCreateError) {
        throw new Error(profileCreateError.message);
      }
    }

    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .limit(1);

    if (rolesError) {
      throw new Error(rolesError.message);
    }

    let role = RoleSchema.safeParse(roles?.[0]?.role).success ? (roles?.[0]?.role as "admin" | "utility_staff") : null;

    if (!role) {
      const { error: roleCreateError } = await supabaseAdmin.from("user_roles").insert({
        user_id: userId,
        role: metadataRole,
      });

      if (roleCreateError) {
        throw new Error(roleCreateError.message);
      }

      role = metadataRole;
    }

    return { role, profile: currentProfile };
  });