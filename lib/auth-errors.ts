export function authErrorMessage(error: { message?: string } | null | undefined) {
  const message = error?.message?.trim() || "Authentication failed";
  if (/fetch failed|failed to fetch|enotfound|econnrefused|network/i.test(message)) {
    return "Cannot reach your Supabase project. NEXT_PUBLIC_SUPABASE_URL does not resolve — the project may be paused, deleted, or the URL is wrong.";
  }
  return message;
}
