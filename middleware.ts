import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  // Signed webhooks: Stripe (/api/webhook) and Clerk (/api/webhooks/clerk)
  "/api/webhook(.*)",
  // Authenticated with CRON_SECRET instead of a Clerk session
  "/api/cron(.*)",
  "/privacy",
  "/terms",
]);

// Readable whether signed in or not, with or without an organization
const isLegalRoute = createRouteMatcher(["/privacy", "/terms"]);

// About the signed-in person, so no active organization is needed
const isPersonalRoute = createRouteMatcher(["/api/me(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    const { userId, orgId, redirectToSignIn } = await auth();
    const isPublic = isPublicRoute(req);
    const isLegal = isLegalRoute(req);

    // Signed-in users skip the landing page and go to their organization
    if (
      userId &&
      isPublic &&
      !isLegal &&
      !req.nextUrl.pathname.startsWith("/api/")
    ) {
      const path = orgId ? `/organization/${orgId}` : "/select-org";
      return NextResponse.redirect(new URL(path, req.url));
    }

    if (!userId && !isPublic) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    if (
      userId &&
      !orgId &&
      !isLegal &&
      !isPersonalRoute(req) &&
      req.nextUrl.pathname !== "/select-org"
    ) {
      return NextResponse.redirect(new URL("/select-org", req.url));
    }
  },
  {
    // Activate the organization in the URL before rendering, so org pages
    // never render with the previously active organization
    organizationSyncOptions: {
      organizationPatterns: ["/organization/:id", "/organization/:id/(.*)"],
    },
  }
);

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
