import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import Advocate from "@/utils/models/advocate";
import SOSRequest from "@/utils/models/SOSRequest";
import { withAuth } from "@/utils/withAuth";
import { pusher } from "@/utils/libs/pusher";

export async function POST(req: NextRequest) {
  const auth = await withAuth(req, "advocate");
  if ("error" in auth) return auth.error;

  const lawyerId = auth.payload.id;

  try {
    await connectDB();
    const body = await req.json();
    const { lat, lng, sosStatus } = body;

    if (lat === undefined || lng === undefined) {
      return NextResponse.json(
        { success: false, message: "lat and lng are required" },
        { status: 400 }
      );
    }

    // Find and update Advocate
    const advocate = await Advocate.findById(lawyerId);
    if (!advocate) {
      return NextResponse.json(
        { success: false, message: "Advocate not found" },
        { status: 404 }
      );
    }

    // Update location details
    advocate.currentLocation = {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)],
    };

    if (sosStatus) {
      advocate.sosStatus = sosStatus;
      advocate.isOnline = sosStatus !== "offline";
    }

    await advocate.save();

    // Check if this advocate is on an active SOS request
    const activeSOS = await SOSRequest.findOne({
      lawyerId: lawyerId,
      status: { $in: ["accepted", "en_route", "arrived"] },
    });

    if (activeSOS) {
      // Trigger dynamic Uber-like tracking for the client
      await pusher.trigger(`sos-${activeSOS._id}`, "location-update", {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      });

      // Trigger tracking for admin
      await pusher.trigger("admin-sos", "lawyer-location", {
        sosId: activeSOS._id.toString(),
        lawyerId: lawyerId.toString(),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Location updated successfully",
      location: advocate.currentLocation,
    });
  } catch (error: any) {
    console.error("Update Location Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update location", error: error.message },
      { status: 500 }
    );
  }
}
