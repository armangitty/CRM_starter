import { NextResponse, type NextRequest } from "next/server";
import { ensureAgencyForUser, destinationForWorkspace } from "@/lib/agency";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Missing confirmation code")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const result = await ensureAgencyForUser(supabase, user);
  if (result.status === "error") {
    return NextResponse.redirect(
      `${origin}/signup?error=${encodeURIComponent(result.message)}`,
    );
  }

  const path =
    next?.startsWith("/") && !next.startsWith("//")
      ? next
      : destinationForWorkspace(result.status);
  return NextResponse.redirect(`${origin}${path}`);
}
