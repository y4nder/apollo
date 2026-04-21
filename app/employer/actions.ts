"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../lib/supabase/server";
import { createSupabaseAdminClient } from "../lib/supabase/admin";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export type AuthActionState =
  | { error: string }
  | { error?: undefined };

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/employer");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect(next);
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const companyName = String(formData.get("companyName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();

  if (!email || !password || !companyName) {
    return { error: "Email, password, and company name are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { company_name: companyName, contact_name: contactName },
    },
  });
  if (error) return { error: error.message };

  // Insert the employers row via admin so RLS doesn't block before the
  // client-side session hydrates.
  if (data.user) {
    const admin = createSupabaseAdminClient();
    let slug = slugify(companyName);
    if (!slug) slug = `employer-${data.user.id.slice(0, 8)}`;

    // Ensure uniqueness of slug by appending a suffix if needed.
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate =
        attempt === 0 ? slug : `${slug}-${data.user.id.slice(0, 4 + attempt)}`;
      const { error: empErr } = await admin.from("employers").insert({
        id: data.user.id,
        company_name: companyName,
        contact_name: contactName || null,
        slug: candidate,
      });
      if (!empErr) break;
      // 23505 unique_violation → try again with a longer suffix
      if ((empErr as { code?: string }).code !== "23505") {
        return { error: empErr.message };
      }
    }
  }

  // If email confirmation is enabled on the Supabase project, there's no
  // session yet — push them to login with a note.
  if (!data.session) {
    redirect("/employer/login?msg=check-email");
  }
  redirect("/employer");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/employer/login");
}
