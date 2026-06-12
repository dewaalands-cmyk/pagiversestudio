import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes: only allow admin role
    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }

    // Client portal: allow client and admin
    if (path.startsWith("/client-portal")) {
      if (!token || (token.role !== "client" && token.role !== "admin")) {
        return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/client-portal/:path*", "/profile/:path*"],
};
