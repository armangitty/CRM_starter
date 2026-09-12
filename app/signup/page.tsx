import Link from "next/link";
import { signUpAgency } from "@/app/actions/auth";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-12">
      <p className="text-xs uppercase tracking-[0.28em] text-amber-500/90">
        Leadport
      </p>
      <h1 className="font-display mt-3 text-4xl text-white">Create your agency</h1>
      <p className="mt-2 text-sm text-stone-400">
        You will add client companies and issue portal logins from the dashboard.
      </p>
      {params.error ? (
        <p className="mt-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {params.error}
        </p>
      ) : null}
      <form action={signUpAgency} className="mt-8 space-y-4">
        <div>
          <label htmlFor="agency_name">Agency name</label>
          <input id="agency_name" name="agency_name" required />
        </div>
        <div>
          <label htmlFor="full_name">Your name</label>
          <input id="full_name" name="full_name" required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" minLength={8} required />
        </div>
        <button type="submit" className="w-full">
          Create agency
        </button>
      </form>
      <p className="mt-6 text-sm text-stone-500">
        Already have access?{" "}
        <Link href="/login" className="text-amber-500">
          Sign in
        </Link>
      </p>
    </div>
  );
}
