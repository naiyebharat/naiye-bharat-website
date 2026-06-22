import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import SOSRequest from "@/utils/models/SOSRequest";
import User from "@/utils/models/User";
import { withAuth } from "@/utils/withAuth";

export async function GET(req: NextRequest) {
  const auth = await withAuth(req, "advocate");
  if ("error" in auth) return auth.error;

  const lawyerId = auth.payload.id;

  try {
    await connectDB();

    const pendingSOS = await SOSRequest.find({
      status: "pending",
      $or: [
        { targetLawyers: lawyerId },
        { targetLawyers: { $exists: false } },
        { targetLawyers: { $size: 0 } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean() as any[];

    const data = [];

    for (const sos of pendingSOS) {
      const client = await User.findById(sos.clientId)
        .select("name phoneNumber")
        .lean() as any;

      data.push({
        id: sos._id.toString(),
        sosId: sos._id.toString(),
        requestType: "sos",
        name: client?.name || "Emergency Client",
        issue: sos.emergencyType || "Emergency Legal Assistance",
        lastMessage: `SOS payout Rs ${sos.payout || 3600}`,
        lastMessageTime: sos.createdAt
          ? new Date(sos.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
          : "",
        status: "pending_expert",
        isAssigned: false,
        payout: sos.payout || 3600,
        lat: sos.clientLocation?.coordinates?.[1],
        lng: sos.clientLocation?.coordinates?.[0],
        createdAt: sos.createdAt,
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Pending SOS Fetch Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch pending SOS requests", error: error.message },
      { status: 500 }
    );
  }
}
