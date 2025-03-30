import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url); // ✅ Extract URL
    const id = url.pathname.split('/').pop(); // ✅ Extract ID from URL

      if (!id) {
        return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
      }

    const body = await req.json();

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: { ...body }
    });

    return NextResponse.json({ message: 'Expense updated successfully', updatedExpense }, { status: 200 });
  } catch (error) {
    console.error('Error updating Expense:', error);
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    const expenseDetail = await  prisma.expense.findUnique({ where: { id: id } });

    if(!expenseDetail) {
      return NextResponse.json({ message: `expense doesn't exist with expenseId: ${id}` }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'expense deleted successfully!', expenseId: id }, { status: 200 });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Delete expense failed' }, { status: 500 });
  }
}
