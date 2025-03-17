import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { verify } from "./lib/commonFunction";

const JWT_SECRET = process.env.JWT_SECRET!;

export const runtime = "nodejs";

const protectedRoutes = ['/', "/users", "/tokens"];
const publicRoutes = ["/login", "/signup"];

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // ✅ Redirect authenticated users from /login to home page "/"
  if (req.nextUrl.pathname === "/login" && token) {
    try {
      await verify(token, JWT_SECRET);
      return NextResponse.redirect(new URL("/", req.url)); // Redirect to home page
    } catch (error) {
      console.error("Invalid Token:", error);
    }
  }

  // ✅ Allow Next.js internal assets and public routes
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/images") ||
    req.nextUrl.pathname.startsWith("/favicon.ico") ||
    req.nextUrl.pathname.startsWith("/api/auth/") ||
    publicRoutes.includes(req.nextUrl.pathname)
  ) {
    return NextResponse.next();
  }

  // ✅ Ensure protected API routes require Authorization header
  // if (req.nextUrl.pathname.startsWith("/api")) {
  //   const authHeader = req.headers.get("Authorization");

  //   if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //     return NextResponse.json({ error: "Unauthorized: Missing Authorization Header" }, { status: 401 });
  //   }

  //   const token = authHeader.split(" ")[1]; // Extract token from "Bearer TOKEN"
  //   try {
  //     await verify(token, JWT_SECRET);
  //     return NextResponse.next();
  //   } catch (error) {
  //     return NextResponse.json({ error: "Unauthorized: Invalid Token" }, { status: 403 });
  //   }
  // }

  // ✅ Protect private routes: Redirect unauthenticated users to /login
  if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      await verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      console.error("Invalid Token:", error);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api/auth|api/public|favicon.ico|images|fonts|styles|robots.txt|sitemap.xml).*)",
  ],
};
