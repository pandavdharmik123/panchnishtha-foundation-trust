import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url); // ✅ Extract URL
    const id = url.pathname.split('/').pop(); // ✅ Extract ID from URL

      if (!id) {
        return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
      }

    const body = await req.json();

    const updatedToken = await prisma.tokenRequest.update({
      where: { id },
      data: { ...body },
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
    });

    return NextResponse.json({ message: 'Token updated successfully', updatedToken }, { status: 200 });
  } catch (error) {
    console.error('Error updating token:', error);
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
    }

    const tokenDetails = await  prisma.tokenRequest.findUnique({ where: { id: id } });

    if(!tokenDetails) {
      return NextResponse.json({ message: `Token doesn't exist with tokenId: ${id}` }, { status: 404 });
    }

    await prisma.tokenRequest.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Token deleted successfully!', tokenId: id }, { status: 200 });
  } catch (error) {
    console.error('Error updating token:', error);
    return NextResponse.json({ error: 'Delete token failed' }, { status: 500 });
  }
}
