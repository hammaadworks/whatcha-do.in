"use server";

import { createServerSideClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { sendLarkMessage } from "@/lib/lark";

export async function verifySocialUnlock(themeId: string, socialLink: string) {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // 1. Notify Admin via Lark
  const message = `**User:** ${user.email} (${user.id})\n**Theme:** ${themeId}\n**Proof:** ${socialLink}`;
  const sent = await sendLarkMessage(message, "🚀 New Social Unlock Request");

  if (!sent) {
      // Fallback: Still unlock but log error? Or fail?
      // "Optimistic" unlock means we trust the user but want the notification.
      // If notification fails, we might still want to unlock to not punish user for our infra issue.
      console.error("Failed to send Lark notification for social unlock.");
  }

  // 2. Grant Unlock
  // We trust the user's submission for now (Optimistic Verification)
  // Admin can revoke later if link is fake (Manual Review)
  return await purchaseTheme(themeId, 'social');
}

export async function purchaseTheme(themeId: string, source: 'payment' | 'social' = 'payment') {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // 1. Fetch current purchased themes
  const { data: profile } = await supabase
    .from("users")
    .select("purchased_themes")
    .eq("id", user.id)
    .single();

  const currentThemes = profile?.purchased_themes || [];

  if (currentThemes.includes(themeId)) {
    return { success: true, message: "Already owned" };
  }

  // 2. Mock Payment Processing (always success for now)
  // await processPayment(...)

  // 3. Update DB
  const newThemes = [...currentThemes, themeId];
  const { error } = await supabase
    .from("users")
    .update({ purchased_themes: newThemes })
    .eq("id", user.id);

  if (error) {
    console.error("Purchase failed:", error);
    return { error: "Failed to update profile" };
  }

  // Notify Admin of Purchase (Async) - Only if it's a direct payment
  if (source === 'payment') {
      const message = `**User:** ${user.email} (${user.id})\n**Theme:** ${themeId}`;
      await sendLarkMessage(message, "💰 New Theme Purchase");
  }

  revalidatePath("/me"); // Revalidate where the user profile is shown
  return { success: true, newThemes };
}
