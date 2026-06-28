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
    const { sosId } = body;

    if (!sosId) {
      return NextResponse.json(
        { success: false, message: "sosId is required" },
        { status: 400 }
      );
    }

    // Find the SOS request
    const sos = await SOSRequest.findById(sosId);
    if (!sos) {
      return NextResponse.json(
        { success: false, message: "SOS request not found" },
        { status: 404 }
      );
    }

    // Check if already accepted
    if (sos.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "This SOS request has already been accepted or handled" },
        { status: 400 }
      );
    }

    // Retrieve advocate details to send to the client
    const advocate = await Advocate.findById(lawyerId).select("-password");
    if (!advocate) {
      return NextResponse.json(
        { success: false, message: "Advocate not found" },
        { status: 404 }
      );
    }

    // Update SOS Request
    sos.lawyerId = lawyerId;
    sos.status = "accepted";
    sos.eta = "12 mins"; // Initial mock ETA
    await sos.save();

    // Update Advocate status to busy
    advocate.sosStatus = "busy";
    await advocate.save();

    // Trigger Pusher notification for Client
    try {
      await pusher.trigger(`sos-${sosId}`, "status-update", {
        status: "accepted",
        lawyer: {
          id: advocate._id.toString(),
          name: advocate.name,
          phoneNumber: advocate.phoneNumber,
          experience: advocate.experience,
          specialty: advocate.specialty,
          avatar: advocate.avatar || "",
          currentLocation: advocate.currentLocation,
        },
        eta: "12 mins",
      });
    } catch (err) {
      console.error("Failed to trigger Pusher status-update for client:", err);
    }

    // Trigger Pusher notification for Admin
    try {
      await pusher.trigger("admin-sos", "sos-updated", {
        sosId: sos._id.toString(),
        status: "accepted",
        lawyerId: lawyerId.toString(),
      });
    } catch (err) {
      console.error("Failed to trigger Pusher sos-updated for admin:", err);
    }

    return NextResponse.json({
      success: true,
      message: "SOS request accepted successfully",
      sos,
    });
  } catch (error: any) {
    console.error("SOS Accept Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to accept SOS request", error: error.message },
      { status: 500 }
    );
  }
}
