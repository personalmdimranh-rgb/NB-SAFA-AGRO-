/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig);

export const proxy = auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role as string | undefined;
  const status = (req.auth?.user as any)?.status as string | undefined;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isDealerRoute = nextUrl.pathname.startsWith("/dealer");
  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

  // Redirect legacy NB SAFA AGRO e-commerce routes to new Shafa Agro home
  const isLegacyEcommerceRoute = [
    "/shop",
    "/cart",
    "/checkout",
    "/wishlist",
    "/product",
    "/categories"
  ].some(route => nextUrl.pathname.startsWith(route));

  if (isLegacyEcommerceRoute) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // 1. Redirection for logged-in users on Auth routes (Login/Register)
  if (isAuthRoute && isLoggedIn) {
    if (role === "admin" || role === "super_admin" || role === "manager" || role === "staff") {
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    }
    if (role === "director") {
      return NextResponse.redirect(new URL("/admin/director", nextUrl));
    }
    if (role === "dealer") {
      return NextResponse.redirect(new URL("/dealer/dashboard", nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 2. Protection for Admin routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    const userId = (req.auth?.user as any)?.id || (req.auth?.user as any)?._id;
    const isOwnStaffProfile = role === "staff" && nextUrl.pathname === `/admin/users/${userId}`;

    // Check if director-only sub-route
    const isDirectorRoute = nextUrl.pathname.startsWith("/admin/director");
    if (isDirectorRoute) {
      if (role !== "director" && role !== "super_admin") {
        return NextResponse.redirect(new URL("/login", nextUrl));
      }
    } else {
      // Allow super_admin, admin, manager on other admin routes
      // Allow staff ONLY on their own profile page
      const isAllowedAdminUser = ["admin", "super_admin", "manager"].includes(role || "") || isOwnStaffProfile;
      if (!isAllowedAdminUser) {
        if (role === "director") {
          return NextResponse.redirect(new URL("/admin/director", nextUrl));
        }
        if (role === "dealer") {
          return NextResponse.redirect(new URL("/dealer/dashboard", nextUrl));
        }
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
      }
    }

    // /admin/system-design → strictly super_admin
    const isSystemDesignRoute = nextUrl.pathname.startsWith("/admin/system-design");
    if (isSystemDesignRoute && role !== "super_admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    }
  }

  // 3. Protection for Dealer routes
  if (isDealerRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // Only allow active dealers
    if (role !== "dealer" || status === "inactive") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  // 4. Protection and Redirection for Customer Dashboard routes
  const isDashboardRoute = nextUrl.pathname === "/dashboard" || nextUrl.pathname.startsWith("/dashboard/");
  if (isDashboardRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // Redirect admins, directors, dealers to their respective dashboards
    if (role === "admin" || role === "super_admin" || role === "manager" || role === "staff") {
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    }
    if (role === "director") {
      return NextResponse.redirect(new URL("/admin/director", nextUrl));
    }
    if (role === "dealer") {
      return NextResponse.redirect(new URL("/dealer/dashboard", nextUrl));
    }
  }

  req.headers.set('x-pathname', nextUrl.pathname);
  const response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });
  response.headers.set('x-pathname', nextUrl.pathname);
  return response;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
