import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { sign } from '../../../../lib/commonFunction';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export const runtime = "nodejs"; // ✅ Ensures compatibility with jsonwebtoken

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    const token = await sign({ id: user.id, role: user.role }, JWT_SECRET);
    const response = NextResponse.json({ success: true, token, userId: user.id, userEmail: user.email });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
