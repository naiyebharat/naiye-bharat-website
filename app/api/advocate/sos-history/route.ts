import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import SOSRequest from "@/utils/models/SOSRequest";
import User from "@/utils/models/User";
import SOSMessage from "@/utils/models/SOSMessage";
import { withAuth } from "@/utils/withAuth";

export async function GET(req: NextRequest) {
  const auth = await withAuth(req, "advocate");
  if ("error" in auth) return auth.error;

  const lawyerId = auth.payload.id;

  try {
    await connectDB();

    // Fetch all completed/cancelled SOS for this advocate, newest first
    const sosList = await SOSRequest.find({
      lawyerId,
      status: { $in: ["completed", "cancelled"] },
    })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean() as any[];

    const data = [];

    for (const sos of sosList) {
      // Fetch client info
      const client = await User.findById(sos.clientId)
        .select("name phoneNumber email")
        .lean() as any;

      // Fetch all messages for this SOS
      const messages = await SOSMessage.find({ sosId: sos._id })
        .sort({ createdAt: 1 })
        .lean() as any[];

      data.push({
        id: sos._id.toString(),
        emergencyType: sos.emergencyType || "General Emergency",
        status: sos.status,
        amountPaid: sos.amountPaid || 4500,
        payout: sos.payout || 3600,
        paymentReleased: !!sos.paymentReleased,
        createdAt: sos.createdAt,
        updatedAt: sos.updatedAt,
        client: client
          ? { name: client.name, phoneNumber: client.phoneNumber || "", email: client.email || "" }
          : { name: "Unknown Client", phoneNumber: "", email: "" },
        messages: messages.map((m) => ({
          id: m._id.toString(),
          senderType: m.senderType,
          senderName: m.senderName,
          text: m.text,
          createdAt: m.createdAt.toISOString(),
        })),
      });
    }

    return NextResponse.json({ success: true, history: data });
  } catch (error: any) {
    console.error("Advocate SOS History Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch SOS history", error: error.message },
      { status: 500 }
    );
  }
}
