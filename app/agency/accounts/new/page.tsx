import { Flash } from "@/components/app-shell";
import { createClientAccount } from "@/app/actions/auth";

export default async function NewAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="max-w-lg">
      <h1 className="font-display text-4xl text-foreground">New client company</h1>
      <p className="mt-2 text-muted-foreground">
        This creates a GoHighLevel-style sub-account: CRM, booking page, and
        portal access you can issue next.
      </p>
      <Flash error={params.error} />
      <form action={createClientAccount} className="mt-8 space-y-4">
        <div>
          <label htmlFor="name">Company name</label>
          <input id="name" name="name" required placeholder="Northshore Dental" />
        </div>
        <div>
          <label htmlFor="industry">Industry</label>
          <input id="industry" name="industry" placeholder="Dental, HVAC, Med spa…" />
        </div>
        <button type="submit">Create sub-account</button>
      </form>
    </div>
  );
}
