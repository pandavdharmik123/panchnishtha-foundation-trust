import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL));

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
