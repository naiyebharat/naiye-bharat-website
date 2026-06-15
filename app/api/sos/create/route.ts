import { NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import SOSRequest from "@/utils/models/SOSRequest";
import { pusher } from "@/utils/libs/pusher";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      clientId,
      lat,
      lng,
      paymentId,
    } = body;

    const sos = await SOSRequest.create({
      clientId,

      paymentId,

      clientLocation: {
        type: "Point",
        coordinates: [lng, lat],
      },

      status: "waiting_for_lawyer",
    });

    await pusher.trigger(
      "lawyers",
      "new-sos",
      {
        sosId: sos._id.toString(),
        lat,
        lng,
        paymentAmount: 4500,
      }
    );

    return NextResponse.json({
      success: true,
      sosId: sos._id,
    });
  } catch (error) {
    console.error("SOS Create Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create SOS request",
      },
      {
        status: 500,
      }
    );
  }
}