import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import ClientOrder from "@/utils/models/Order";
import { withAuth } from "@/utils/withAuth";

export async function POST(req: NextRequest) {
  const auth = await withAuth(req, "client");

  try {
    const body = await req.json();
    const {
      clientName,
      clientAge,
      email,
      phoneNumber,
      specialty,
      language,
      issueDescription,
      selectedDate,
      selectedTimeSlot,
    } = body;

    if (
      !clientName ||
      !clientAge ||
      !email ||
      !phoneNumber ||
      !specialty ||
      !language ||
      !issueDescription ||
      !selectedDate ||
      !selectedTimeSlot
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required onboarding telemetry fields." },
        { status: 400 },
      );
    }

    if ("error" in auth) {
      return NextResponse.json(
        {
          success: true,
          message: "Guest intake received. Showing matched experts without creating an order.",
          orderCreated: false,
          orderId: null,
          matchCriteria: { specialty, language },
        },
        { status: 200 },
      );
    }

    const { payload } = auth;
    const verifiedEmail = payload.email.toLowerCase().trim();
    const verifiedUserId = payload.id;

    await connectDB();

    const newOrder = await ClientOrder.create({
      clientName,
      clientAge: Number(clientAge),
      email: verifiedEmail,
      userId: verifiedUserId,
      phoneNumber,
      specialty,
      language,
      issueDescription,
      selectedDate,
      selectedTimeSlot,
      expertId: null,
      sessionCost: 0,
      paymentStatus: "pending",
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      expireAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Client intake packet generated successfully.",
        orderCreated: true,
        orderId: newOrder._id,
        matchCriteria: { specialty, language },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("API Pipeline Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server crash at ingestion gateway.",
      },
      { status: 500 },
    );
  }
}
