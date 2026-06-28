import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pusher } from "@/utils/libs/pusher";
import { connectDB } from "@/utils/dbConnect";
import SOSRequest from "@/utils/models/SOSRequest";
import User from "@/utils/models/User";
import Advocate from "@/utils/models/advocate";
import { sendPushNotification } from "@/utils/sendPushNotification";

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_PIPELINE_KEY_9999";


function getActor(req: NextRequest) {
  const cookies = [
    req.cookies.get("admin_auth_token")?.value,
    req.cookies.get("advocate_auth_token")?.value,
    req.cookies.get("client_auth_token")?.value,
  ].filter(Boolean) as string[];

  for (const token of cookies) {
    try {
      return jwt.verify(token, JWT_SECRET) as any;
    } catch {}
  }

  return null;
}

export async function POST(req: NextRequest) {
  const actor = getActor(req);
  if (!actor?.id || !actor?.role) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { sosId, action, callType, roomId, signal } = body;

  if (!sosId || !action) {
    return NextResponse.json({ success: false, message: "sosId and action are required" }, { status: 400 });
  }

  const safeRoomId = roomId || `sos_${String(sosId).replace(/[^a-zA-Z0-9_-]/g, "")}`;
  
  let eventName = "call-invite";
  if (action === "end") {
    eventName = "call-ended";
  } else if (action === "accept") {
    eventName = "call-accepted";
  } else if (action === "signal") {
    eventName = "webrtc-signal";
  }

  try {
    await pusher.trigger(`sos-${sosId}`, eventName, {
      sosId,
      roomId: safeRoomId,
      callType: callType === "audio" ? "audio" : "video",
      from: {
        id: actor.id,
        name: actor.name || actor.email || actor.role,
        role: actor.role,
      },
      signal,
    });
  } catch (err) {
    console.error("Failed to trigger WebRTC Pusher signal:", err);
  }

  if (action === "invite") {
    try {
      await connectDB();
      const sos = await SOSRequest.findById(sosId);
      if (sos) {
        let recipientToken = "";
        const senderName = actor.name || actor.email || actor.role;
        if (actor.role === "client") {
          if (sos.lawyerId) {
            const advocate = await Advocate.findById(sos.lawyerId);
            if (advocate && advocate.fcmToken) {
              recipientToken = advocate.fcmToken;
            }
          }
        } else {
          const client = await User.findById(sos.clientId);
          if (client && client.fcmToken) {
            recipientToken = client.fcmToken;
          }
        }

        if (recipientToken) {
          await sendPushNotification(
            recipientToken,
            `🚨 EMERGENCY CALL: ${senderName}`,
            `Incoming SOS ${callType === "audio" ? "Voice" : "Video"} Call. Tap to answer.`,
            { sosId, type: "sos_call", callType: callType || "video", senderId: actor.id }
          );
        }
      }
    } catch (notifErr) {
      console.error("Failed to send FCM call notification:", notifErr);
    }
  }

  return NextResponse.json({ success: true, roomId: safeRoomId });

}

