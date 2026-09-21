import { updatePassword } from "@/app/actions/auth";
import { MarketingFooter, MarketingHeader } from "@/components/marketing-header";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="flex min-h-full flex-col">
      <MarketingHeader />
      <main className="relative flex flex-1 items-center justify-center px-5 py-16">
        <div className="surface relative w-full max-w-md shadow-sm">
          <div className="p-6 pb-2 text-center">
            <h1 className="font-display text-3xl tracking-tight">Choose a new password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Supabase Auth hashes and stores this. It is not saved in app tables.
            </p>
          </div>
          <form action={updatePassword} className="space-y-4 p-6 pt-4">
            {params.error ? (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {params.error}
              </p>
            ) : null}
            <div>
              <label htmlFor="password">New password</label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirm_password">Confirm password</label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="w-full">
              Update password
            </button>
          </form>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
