import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth-redirect";
import { isAgencyRole, type Membership } from "@/lib/types";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith("/agency") ||
    path.startsWith("/portal") ||
    path === "/auth/reset-password" ||
    path === "/auth/setup";
  const isAuthPage = path === "/login" || path === "/signup";

  if (isProtected && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    const next = safeNextPath(path);
    if (next) redirect.searchParams.set("next", next);
    return NextResponse.redirect(redirect);
  }

  if (isAuthPage && user) {
    const { data: memberships } = await supabase
      .from("memberships")
      .select("id, user_id, organization_id, client_account_id, role")
      .eq("user_id", user.id);

    const rows = (memberships ?? []) as Membership[];
    const target = request.nextUrl.clone();
    if (rows.some((m) => isAgencyRole(m.role))) {
      target.pathname = "/agency";
      return NextResponse.redirect(target);
    }
    if (rows.some((m) => m.client_account_id)) {
      target.pathname = "/portal";
      return NextResponse.redirect(target);
    }
    if (path === "/login") {
      target.pathname = "/auth/setup";
      return NextResponse.redirect(target);
    }
  }

  return response;
}
