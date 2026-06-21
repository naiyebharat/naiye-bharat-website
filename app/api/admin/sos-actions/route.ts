import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import SOSRequest from "@/utils/models/SOSRequest";
import Advocate from "@/utils/models/advocate";
import User from "@/utils/models/User";
import { withAuth } from "@/utils/withAuth";
import { pusher } from "@/utils/libs/pusher";

// GET /api/admin/sos-actions - Get all SOS requests with client & lawyer info
export async function GET(req: NextRequest) {
  const auth = await withAuth(req, "admin");
  if ("error" in auth) return auth.error;

  try {
    await connectDB();

    // Fetch all requests sorted by latest
    const sosRequests = await SOSRequest.find().sort({ createdAt: -1 }).lean();

    const enriched = [];
    for (const sos of sosRequests as any[]) {
      // Find client
      const client = await User.findById(sos.clientId).select("name email phoneNumber").lean() as any;
      // Find lawyer
      let lawyer = null;
      if (sos.lawyerId) {
        lawyer = await Advocate.findById(sos.lawyerId).select("name email phoneNumber specialty experience avatar currentLocation").lean();
      }

      enriched.push({
        ...sos,
        client: client || { name: "Unknown Client", email: "", phoneNumber: "" },
        lawyer: lawyer || null,
      });
    }

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    console.error("Admin Fetch SOS Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch SOS requests", error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/sos-actions - Handle specific admin actions
export async function POST(req: NextRequest) {
  const auth = await withAuth(req, "admin");
  if ("error" in auth) return auth.error;

  try {
    await connectDB();
    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, message: "action parameter is required" },
        { status: 400 }
      );
    }

    // --- Action: Get Available Lawyers ---
    if (action === "get-available-lawyers") {
      const lawyers = await Advocate.find({
        isVerifiedSOS: true,
        sosStatus: "available",
      }).select("name specialty experience currentLocation").lean();

      return NextResponse.json({ success: true, lawyers });
    }

    // --- Action: Get All Lawyers for Verification ---
    if (action === "get-all-lawyers") {
      const lawyers = await Advocate.find().select("name specialty experience isVerifiedSOS sosStatus email phoneNumber").lean();
      return NextResponse.json({ success: true, lawyers });
    }

    // --- Action: Toggle Lawyer SOS Verification ---
    if (action === "toggle-verification") {
      const { advocateId, verify } = body;
      if (!advocateId) {
        return NextResponse.json({ success: false, message: "advocateId is required" }, { status: 400 });
      }

      const advocate = await Advocate.findByIdAndUpdate(
        advocateId,
        { isVerifiedSOS: !!verify },
        { new: true }
      ).select("-password");

      return NextResponse.json({ success: true, advocate });
    }

    // --- Action: Reassign Lawyer ---
    if (action === "reassign") {
      const { sosId, lawyerId } = body;
      if (!sosId || !lawyerId) {
        return NextResponse.json(
          { success: false, message: "sosId and lawyerId are required for reassignment" },
          { status: 400 }
        );
      }

      const sos = await SOSRequest.findById(sosId);
      if (!sos) {
        return NextResponse.json({ success: false, message: "SOS request not found" }, { status: 404 });
      }

      const oldLawyerId = sos.lawyerId;

      // Verify the new advocate exists and is available
      const newAdvocate = await Advocate.findById(lawyerId);
      if (!newAdvocate) {
        return NextResponse.json({ success: false, message: "New advocate not found" }, { status: 404 });
      }

      // Reassign in DB
      sos.lawyerId = lawyerId;
      sos.status = "accepted";
      sos.eta = "10 mins"; // Reset ETA
      await sos.save();

      // Free up old lawyer if there was one
      if (oldLawyerId) {
        await Advocate.findByIdAndUpdate(oldLawyerId, { sosStatus: "available" });
        // Notify old lawyer that they were unassigned
        await pusher.trigger(`lawyer-sos-${oldLawyerId}`, "sos-unassigned", {
          sosId: sosId.toString(),
        });
      }

      // Mark new lawyer as busy
      newAdvocate.sosStatus = "busy";
      await newAdvocate.save();

      // Broadcast new lawyer info to the client
      const lawyerData = {
        id: newAdvocate._id.toString(),
        name: newAdvocate.name,
        phoneNumber: newAdvocate.phoneNumber,
        experience: newAdvocate.experience,
        specialty: newAdvocate.specialty,
        avatar: newAdvocate.avatar || "",
        currentLocation: newAdvocate.currentLocation,
      };

      await pusher.trigger(`sos-${sosId}`, "status-update", {
        status: "accepted",
        lawyer: lawyerData,
        eta: "10 mins",
      });

      // Broadcast to new lawyer that they are assigned
      await pusher.trigger(`lawyer-sos-${lawyerId}`, "sos-assigned", {
        sosId: sosId.toString(),
        emergencyType: sos.emergencyType,
        clientLocation: sos.clientLocation,
        amountPaid: sos.amountPaid,
      });

      // Broadcast updated state to admin
      await pusher.trigger("admin-sos", "sos-updated", {
        sosId: sosId.toString(),
        status: "accepted",
        lawyerId: lawyerId.toString(),
      });

      return NextResponse.json({
        success: true,
        message: "Lawyer reassigned successfully",
        sos,
      });
    }

    // --- Action: Release Payment ---
    if (action === "release-payment") {
      const { sosId } = body;
      if (!sosId) {
        return NextResponse.json({ success: false, message: "sosId is required" }, { status: 400 });
      }

      const sos = await SOSRequest.findById(sosId);
      if (!sos) {
        return NextResponse.json({ success: false, message: "SOS request not found" }, { status: 404 });
      }

      sos.paymentReleased = true;
      await sos.save();

      // Trigger socket update for admin UI
      await pusher.trigger("admin-sos", "payment-released", {
        sosId: sosId.toString(),
      });

      return NextResponse.json({
        success: true,
        message: "Payment released to lawyer successfully",
        sos,
      });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin Actions SOS Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to perform admin action", error: error.message },
      { status: 500 }
    );
  }
}
