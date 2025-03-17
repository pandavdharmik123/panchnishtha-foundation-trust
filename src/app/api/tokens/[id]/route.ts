import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ensure this exists

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
  }

  const body = await req.json();
  console.log('Request body:', body);

  try {
    const updatedToken = await prisma.tokenRequest.update({
      where: { id: id },
      data: { ...body},
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
      }
    });

    return NextResponse.json({ message: 'Token updated successfully', updatedToken }, { status: 200 });
  } catch (error) {
    console.error('Error updating token:', error);
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
  }
}
