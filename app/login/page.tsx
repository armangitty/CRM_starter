import Link from "next/link";
import { signIn } from "@/app/actions/auth";
import { MarketingFooter, MarketingHeader } from "@/components/marketing-header";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="flex min-h-full flex-col">
      <MarketingHeader />
      <main className="relative flex flex-1 items-center justify-center px-5 py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-[-30%] left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-brand-100 opacity-40 blur-3xl" />
          <div className="absolute right-[-10%] bottom-[-20%] h-[500px] w-[500px] rounded-full bg-brand-200 opacity-30 blur-3xl" />
        </div>
        <div className="surface relative w-full max-w-md shadow-sm">
          <div className="p-6 pb-2 text-center">
            <h1 className="font-display text-3xl tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Confirm your email first if you just created an agency, then sign in.
            </p>
          </div>
          <form action={signIn} className="space-y-4 p-6 pt-4">
            {params.error ? (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {params.error}
              </p>
            ) : null}
            <input type="hidden" name="next" value={params.next ?? ""} />
            <div>
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="w-full">
              Continue
            </button>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
