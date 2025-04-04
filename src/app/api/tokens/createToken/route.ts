import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
// import twilio from 'twilio';

// const accountSid = process.env.TWILIO_ACCOUNT_SID!;
// const authToken = process.env.TWILIO_AUTH_TOKEN!;
// const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!;

// const client = twilio(accountSid, authToken);

export async function POST(req: Request) {
  try {
    const { 
      name,
      documentType,
      mobileNumber,
      isPaymentDone,
      paymentMode,
      isReturn,
      amount,
      userId,
      returnDate
    } = await req.json();

    if(!name || !documentType || !mobileNumber || !paymentMode) {
      return NextResponse.json({ error: "Fill all the required fields" }, { status: 400 });
    }

    const newTokenRequest = await prisma.tokenRequest.create({
      data: { 
        name,
        documentType,
        mobileNumber,
        isPaymentDone,
        paymentMode,
        isReturn,
        amount,
        userId,
        returnDate
      },
      include: {
        userDetail: {
          select: {
            id: true,
            email: true,
            mobileNumber: true,
            dateofBirth: true,
            createdAt: true,
            role: true,
          },
        },
      }
    });

    // if(newTokenRequest.tokenNumber && newTokenRequest.id && newTokenRequest.mobileNumber) {
    //   const { mobileNumber, tokenNumber, createdAt } = newTokenRequest;

    //   const date = new Date(createdAt);
    //   date.setDate(date.getDate() + 1);
    //   const formattedDate = new Intl.DateTimeFormat('gu-IN', {
    //     day: '2-digit',
    //     month: '2-digit',
    //     year: 'numeric',
    //     timeZone: 'Asia/Kolkata', // Ensure correct timezone
    //   }).format(date);

    //   const messageString = `તમારો ટોકન નંબર: ${tokenNumber} છે.\nફોર્મ પરત લેવા આવવાનો સમય: ${formattedDate} 10:00 કલાકે`

    //   await client.messages.create({
    //     body: messageString,
    //     from: twilioPhoneNumber,
    //     to: `+91${mobileNumber}`,
    //   });
    // }

    return NextResponse.json({ ...newTokenRequest, isMessageSent: true }, { status: 200 });
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