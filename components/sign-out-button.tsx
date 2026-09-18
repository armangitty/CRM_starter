import { signOut } from "@/app/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-sm text-muted-foreground transition hover:text-foreground"
      >
        Sign out
      </button>
    </form>
  );
}
