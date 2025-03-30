import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.nextUrl.origin));

  // ✅ Remove token by setting an expired cookie
  response.cookies.set("token", "", {
    path: "/",
    expires: new Date(0), // Expire the cookie
    httpOnly: true, // Ensure it's properly cleared
    secure: process.env.NODE_ENV === "production", // Secure flag in production
    sameSite: "lax",
  });

  return response;
}
