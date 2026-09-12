import { signOut } from "@/app/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-sm text-stone-400 transition hover:text-white"
      >
        Sign out
      </button>
    </form>
  );
}
