import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Next 16 renamed middleware → proxy.
// Keep this thin: session refresh + redirect for unauth'd employer routes.
// Real authorization stays in server components / server actions / route handlers.
export async function proxy(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(all) {
          for (const { name, value, options } of all) {
            res.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;
  const isAuthPage =
    pathname === "/employer/login" || pathname === "/employer/signup";

  if (!user && pathname.startsWith("/employer") && !isAuthPage) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/employer/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthPage) {
    const dashUrl = req.nextUrl.clone();
    dashUrl.pathname = "/employer";
    dashUrl.search = "";
    return NextResponse.redirect(dashUrl);
  }

  return res;
}

export const config = {
  matcher: ["/employer/:path*"],
};
