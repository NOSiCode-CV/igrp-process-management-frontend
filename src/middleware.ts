import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isPreviewMode } from "@/lib/utils";

const PUBLIC_PATHS = ["/login", "/logout", "/api/auth"];

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.includes(".")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip authentication checks if preview mode is enabled
  if (!isPreviewMode()) {
    // IF YOU USE AN AUTHENTICATION STRATEGY, UNCOMMENT THIS BLOCK

    if (isPublicPath(pathname)) return NextResponse.next();

    const token = await getToken({ req: request });

    // `getToken` only decodes the JWT cookie here — it does NOT run the `jwt`
    // callback or refresh the access token. So we must detect an expired session
    // directly, otherwise a stale cookie (expired accessToken, no error flag yet)
    // falls through and the page crashes on the first authenticated API call
    // (e.g. fetchMenus -> 401) instead of redirecting to /login.
    const expiresAt =
      typeof token?.expiresAt === "number" ? token.expiresAt : undefined;
    const isExpired = expiresAt !== undefined && expiresAt < Date.now();

    if (
      !token ||
      token.error === "RefreshAccessTokenError" ||
      isExpired
    ) {
      const loginUrl = new URL(
        "/login",
        process.env.NEXTAUTH_URL_INTERNAL ?? request.url,
      );
      loginUrl.searchParams.set(
        "callbackUrl",
        `${pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// additional paths for apps, is used as subdomains
export const config = {
  matcher: ["/", "/((?!api|apps|health|_next|favicon.ico|.*\\..*).*)"],
};
