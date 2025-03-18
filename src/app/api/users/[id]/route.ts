import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url); // ✅ Extract URL
    const id = url.pathname.split('/').pop(); // ✅ Extract ID from URL

    if (!id) {
      return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
    }

    // Fetch user details from Prisma
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
