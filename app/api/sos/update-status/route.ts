import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import SOSRequest from "@/utils/models/SOSRequest";
import Advocate from "@/utils/models/advocate";
import { withAuth } from "@/utils/withAuth";
import { pusher } from "@/utils/libs/pusher";

export async function POST(req: NextRequest) {
  const auth = await withAuth(req, "advocate");
  if ("error" in auth) return auth.error;

  const lawyerId = auth.payload.id;

  try {
    await connectDB();
    const body = await req.json();
    const { sosId, status } = body;

    const validStatuses = ["en_route", "arrived", "completed", "cancelled"];
    if (!sosId || !status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "sosId and a valid status are required" },
        { status: 400 }
      );
    }

    const sos = await SOSRequest.findById(sosId);
    if (!sos) {
      return NextResponse.json(
        { success: false, message: "SOS request not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (sos.lawyerId?.toString() !== lawyerId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: You are not assigned to this SOS request" },
        { status: 403 }
      );
    }

    // Update status
    sos.status = status;

    if (status === "completed" || status === "cancelled") {
      // Release advocate back to available
      await Advocate.findByIdAndUpdate(lawyerId, {
        sosStatus: "available",
      });
    }

    await sos.save();

    // Trigger Pusher notification for Client
    try {
      await pusher.trigger(`sos-${sosId}`, "status-update", {
        status,
      });
    } catch (err) {
      console.error("Failed to trigger Pusher status-update for client:", err);
    }

    // Trigger Pusher notification for Admin
    try {
      await pusher.trigger("admin-sos", "sos-updated", {
        sosId: sos._id.toString(),
        status,
      });
    } catch (err) {
      console.error("Failed to trigger Pusher sos-updated for admin:", err);
    }

    return NextResponse.json({
      success: true,
      message: `SOS status updated to ${status} successfully`,
      sos,
    });
  } catch (error: any) {
    console.error("SOS Update Status Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update SOS status", error: error.message },
      { status: 500 }
    );
  }
}
