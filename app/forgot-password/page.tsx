import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";
import { MarketingFooter, MarketingHeader } from "@/components/marketing-header";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="flex min-h-full flex-col">
      <MarketingHeader />
      <main className="relative flex flex-1 items-center justify-center px-5 py-16">
        <div className="surface relative w-full max-w-md shadow-sm">
          <div className="p-6 pb-2 text-center">
            <h1 className="font-display text-3xl tracking-tight">Reset password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email. If an account exists, Supabase Auth will send a
              reset link. We never store passwords in our database.
            </p>
          </div>
          {params.sent ? (
            <div className="space-y-4 p-6 pt-4 text-center text-sm text-muted-foreground">
              <p>If that email is registered, a reset link is on its way.</p>
              <Link href="/login" className="font-medium text-primary hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form action={requestPasswordReset} className="space-y-4 p-6 pt-4">
              {params.error ? (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                  {params.error}
                </p>
              ) : null}
              <div>
                <label htmlFor="email">Email address</label>
                <input id="email" name="email" type="email" required autoComplete="email" />
              </div>
              <button type="submit" className="w-full">
                Send reset link
              </button>
              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
