import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role, mobileNumber, dateofBirth } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Validate required fields
    if (!email || !password || !mobileNumber || !dateofBirth) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert dateofBirth to Date object
    const parsedDateOfBirth = new Date(dateofBirth);
    if (isNaN(parsedDateOfBirth.getTime())) {
      return NextResponse.json({ error: "Invalid date format for date of birth" }, { status: 400 });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "USER", // Default role if not provided
        mobileNumber,
        dateofBirth: parsedDateOfBirth,
      },
    });

    console.log("newUser created:", newUser);

    // Generate JWT Token
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "4h" });

    return NextResponse.json({ 
      userName: newUser.email, 
      role: newUser.role, 
      mobileNumber: newUser.mobileNumber,
      dateofBirth: newUser.dateofBirth,
      token
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
