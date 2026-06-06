import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isApiRoute = req.nextUrl.pathname.startsWith("/api");
    const isLoginPage = req.nextUrl.pathname === "/login";

    if (isLoginPage && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (isApiRoute && !token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isApiRoute = req.nextUrl.pathname.startsWith("/api");
        const isLoginPage = req.nextUrl.pathname === "/login";

        // Always run the middleware function for API routes and the login page
        if (isApiRoute || isLoginPage) {
          return true;
        }

        // For all other pages, require token existence (redirects to signIn page if false)
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (uploaded user screenshots)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};
