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

    // Find any active SOS request for this lawyer
    const activeSOS = await SOSRequest.findOne({
      lawyerId,
      status: { $in: ["accepted", "en_route", "arrived"] },
    }).lean() as any;

    if (!activeSOS) {
      return NextResponse.json({ success: true, activeSOS: null });
    }

    // Enrich with client details
    const client = await User.findById(activeSOS.clientId)
      .select("name email phoneNumber")
      .lean() as any;

    return NextResponse.json({
      success: true,
      activeSOS: {
        ...activeSOS,
        client: client || { name: "Unknown Client", phoneNumber: "" },
      },
    });
  } catch (error: any) {
    console.error("Active SOS Fetch Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch active SOS", error: error.message },
      { status: 500 }
    );
  }
}
