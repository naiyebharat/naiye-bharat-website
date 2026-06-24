import { NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import SOSRequest from "@/utils/models/SOSRequest";
import Advocate from "@/utils/models/advocate";
import { pusher } from "@/utils/libs/pusher";
import { sendPushNotification } from "@/utils/sendPushNotification";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      clientId,
      lat,
      lng,
      paymentId,
      emergencyType = "General Emergency",
    } = body;

    if (!clientId || !lat || !lng) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: clientId, lat, lng" },
        { status: 400 }
      );
    }

    // 1. Create the SOS Request in the database
    const sos = await SOSRequest.create({
      clientId,
      paymentId,
      emergencyType,
      clientLocation: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      status: "pending",
      amountPaid: 4500,
      commission: 900,
      payout: 3600,
    });

    // 2. Find the top 5 nearest verified and available advocates
    let nearestLawyers: any[] = [];
    try {
      nearestLawyers = await Advocate.find({
        isVerifiedSOS: true,
        sosStatus: "available",
        currentLocation: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
          },
        },
      }).limit(5);
    } catch (geoError) {
      console.warn("Geospatial index not ready, falling back to basic query:", geoError);
      nearestLawyers = await Advocate.find({
        isVerifiedSOS: true,
        sosStatus: "available",
      }).limit(5);
    }

    // Fallback: If no verified available lawyers are found, fall back to any available lawyers
    if (nearestLawyers.length === 0) {
      console.log("No verified available lawyers found. Falling back to any available lawyers.");
      try {
        nearestLawyers = await Advocate.find({
          sosStatus: "available",
          currentLocation: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)],
              },
            },
          },
        }).limit(5);
      } catch (geoError) {
        nearestLawyers = await Advocate.find({
          sosStatus: "available",
        }).limit(5);
      }
    }

    const targetLawyerIds = nearestLawyers.map((l) => l._id.toString());

    sos.targetLawyers = targetLawyerIds;
    await sos.save();

    // 3. Broadcast the SOS alert via Pusher
    await pusher.trigger("lawyers", "new-sos", {
      sosId: sos._id.toString(),
      emergencyType,
      lat,
      lng,
      payout: 3600,
      targetLawyers: targetLawyerIds,
    });

    // 4. Dispatch Firebase Push Notifications to all target advocates
    for (const lawyer of nearestLawyers) {
      if (lawyer.fcmToken) {
        try {
          await sendPushNotification(
            lawyer.fcmToken,
            "🚨 CRITICAL SOS EMERGENCY ALERT!",
            `New ${emergencyType} request in your area! Tap to accept immediately.`,
            { sosId: sos._id.toString(), type: "sos_broadcast" }
          );
        } catch (fcmErr) {
          console.error(`Failed to send SOS push notification to lawyer ${lawyer._id}:`, fcmErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      sosId: sos._id,
      targetLawyersCount: targetLawyerIds.length,
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
