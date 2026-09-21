import { NextResponse, type NextRequest } from "next/server";
import { ensureAgencyForUser, destinationForWorkspace } from "@/lib/provision-agency";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const supabase = await createClient();
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
  if (result.status === "needs_signup") {
    return NextResponse.redirect(`${origin}/signup`);
  }

  return NextResponse.redirect(
    `${origin}${destinationForWorkspace(result.status)}`,
  );
}
