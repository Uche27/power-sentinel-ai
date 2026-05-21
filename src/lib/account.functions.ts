import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createConfirmedAccount, ensureAccountRecords } from "@/lib/account.server";

const RoleSchema = z.enum(["admin", "utility_staff"]);

const RegisterAccountSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z
    .string()
    .trim()
    .email()
    .max(255)
    .transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(30).optional().default(""),
  role: RoleSchema,
  password: z.string().min(8).max(72),
});

export const registerAccount = createServerFn({ method: "POST" })
  .inputValidator((input) => RegisterAccountSchema.parse(input))
  .handler(async ({ data }) => {
    await createConfirmedAccount(data);
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
    const metadataRole = RoleSchema.safeParse(metadata.role).success
      ? (metadata.role as "admin" | "utility_staff")
      : "utility_staff";
    const fullName =
      typeof metadata.full_name === "string" && metadata.full_name.trim()
        ? metadata.full_name.trim()
        : (authData.user.email ?? "User");
    const phone =
      typeof metadata.phone === "string" && metadata.phone.trim() ? metadata.phone.trim() : null;

    return ensureAccountRecords({
      userId,
      email: authData.user.email ?? "",
      metadata: { ...metadata, full_name: fullName, phone },
      fallbackRole: metadataRole,
    });
  });
