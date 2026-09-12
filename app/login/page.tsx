import Link from "next/link";
import { signIn } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6">
      <p className="text-xs uppercase tracking-[0.28em] text-amber-500/90">
        Leadport
      </p>
      <h1 className="font-display mt-3 text-4xl text-white">Sign in</h1>
      <p className="mt-2 text-sm text-stone-400">
        Agency staff and client portal users use the same login.
      </p>
      {params.error ? (
        <p className="mt-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {params.error}
        </p>
      ) : null}
      <form action={signIn} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={params.next ?? ""} />
        <div>
          <label htmlFor="email">Email</label>
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
      </form>
      <p className="mt-6 text-sm text-stone-500">
        New agency?{" "}
        <Link href="/signup" className="text-amber-500">
          Create an account
        </Link>
      </p>
    </div>
  );
}
