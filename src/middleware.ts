export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/(app)/:path*",
    "/projets/:path*",
    "/personnel/:path*",
  ],
};
