import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const {
            description,
            amount,
            expenseDate,
        } = await req.json();

        if(!description || !amount || !expenseDate) {
            return NextResponse.json({ error: "Fill all the required fields" }, { status: 400 });
        }

        const newExpenseData = await prisma.expense.create({
            data: {
                description,
                amount,
                expenseDate,
            }
        });

        return NextResponse.json({ ...newExpenseData }, { status: 200 });
    } catch(error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json(
            { error: "An unknown error occurred" },
            { status: 500 }
        );
    }

}