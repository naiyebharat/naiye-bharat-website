import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pusher } from "@/utils/libs/pusher";

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
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, roomId: safeRoomId });
}

