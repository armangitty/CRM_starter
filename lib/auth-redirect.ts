const INTERNAL_PREFIXES = [
  "/agency",
  "/portal",
  "/auth/reset-password",
  "/auth/setup",
];

export function safeNextPath(next: string | null | undefined) {
  if (!next) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//") || next.startsWith("/\\")) return null;
  if (next.includes("://") || next.includes("\\")) return null;
  if (INTERNAL_PREFIXES.some((prefix) => next === prefix || next.startsWith(`${prefix}/`) || next.startsWith(`${prefix}?`))) {
    return next;
  }
  return null;
}
