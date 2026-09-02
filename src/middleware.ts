import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ROLE_CHEF_CHANTIER, hrefsAutorisesPourRole } from "@/lib/modules-projet";

export async function middleware(request: NextRequest) {
  // Check for NextAuth v5 session cookie
  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token") ||
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token");

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Restriction par profil : un chef de chantier n'accède qu'aux modules
  // de l'onglet Gestion de Chantier.
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: request.nextUrl.protocol === "https:",
  }).catch(() => null);

  if (token?.role === ROLE_CHEF_CHANTIER) {
    const match = request.nextUrl.pathname.match(/^\/projets\/([^/]+)(?:\/(.*))?$/);
    if (match) {
      const [, projetId, rest = ""] = match;
      const autorises = hrefsAutorisesPourRole(ROLE_CHEF_CHANTIER) ?? [];
      const autorise =
        rest !== "" &&
        autorises.some((h) => rest === h || rest.startsWith(`${h}/`));
      if (!autorise) {
        return NextResponse.redirect(
          new URL(`/projets/${projetId}/${autorises[0]}`, request.url)
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/projets/:path*",
    "/personnel/:path*",
    "/profil/:path*",
    "/materiel/:path*",
  ],
};
