import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pusher } from "@/utils/libs/pusher";
import { connectDB } from "@/utils/dbConnect";
import SOSRequest from "@/utils/models/SOSRequest";
import User from "@/utils/models/User";
import Advocate from "@/utils/models/advocate";
import { sendPushNotification } from "@/utils/sendPushNotification";
import CallSignal from "@/utils/models/CallSignal";

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

  // Also try Authorization header (for React Native which sends token in header)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      return jwt.verify(authHeader.slice(7), JWT_SECRET) as any;
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

  // Store signal in DB for polling clients (React Native)
  try {
    await connectDB();
    await CallSignal.create({
      sosId,
      roomId: safeRoomId,
      action,
      from: actor.id,
      signal: signal || null,
      callType: callType || "video",
      createdAt: new Date(),
    });
  } catch (dbErr) {
    console.error("Failed to store call signal in DB:", dbErr);
  }

  // Also trigger Pusher for web clients
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

// GET endpoint for React Native polling
export async function GET(req: NextRequest) {
  const actor = getActor(req);
  if (!actor?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sosId = searchParams.get("sosId");
  const roomId = searchParams.get("roomId");
  const since = Number(searchParams.get("since") || "0");

  if (!sosId || !roomId) {
    return NextResponse.json({ success: false, message: "sosId and roomId required" }, { status: 400 });
  }

  try {
    await connectDB();
    const signals = await CallSignal.find({
      sosId,
      roomId,
      createdAt: { $gt: new Date(since) },
    })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      success: true,
      signals: signals.map((s: any) => ({
        id: s._id.toString(),
        from: s.from,
        action: s.action,
        signal: s.signal,
        callType: s.callType,
        ts: new Date(s.createdAt).getTime(),
      })),
    });
  } catch (err) {
    console.error("Failed to fetch call signals:", err);
    return NextResponse.json({ success: false, signals: [] });
  }
}
