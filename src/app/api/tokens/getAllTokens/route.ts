import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tokenRequests = await prisma.tokenRequest.findMany({
      include: {
        userDetail: {
          select: {
            id: true,
            email: true,
            mobileNumber: true,
            dateofBirth: true,
            createdAt: true,
            role: true, // Include only necessary fields
          },
        },
      },
      orderBy: {
        tokenNumber: 'desc', // 'asc' for ascending, 'desc' for descending
      },
    });

    return NextResponse.json(tokenRequests);
  } catch (error) {
    console.log('error---', error);
    return NextResponse.json(
      { error: "Something went wrong while fetching token requests" },
      { status: 500 }
    );
  }
}
