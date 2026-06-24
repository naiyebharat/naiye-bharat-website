import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import SOSMessage from "@/utils/models/SOSMessage";
import SOSRequest from "@/utils/models/SOSRequest";
import User from "@/utils/models/User";
import Advocate from "@/utils/models/advocate";
import { pusher } from "@/utils/libs/pusher";
import { sendPushNotification } from "@/utils/sendPushNotification";

// POST: Send a new SOS chat message (persists + broadcasts)
export async function POST(req: Request) {
  try {
    const { sosId, senderType, senderName, text } = await req.json();

    if (!sosId || !senderType || !senderName || !text) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Persist to DB
    const message = await SOSMessage.create({
      sosId,
      senderType,
      senderName,
      text,
    });

    const messageData = {
      id: message._id.toString(),
      senderType: message.senderType,
      senderName: message.senderName,
      text: message.text,
      createdAt: message.createdAt.toISOString(),
    };

    // Broadcast via Pusher for real-time delivery
    await pusher.trigger(`sos-${sosId}`, "chat-message", messageData);

    // Send push notification to the recipient
    try {
      const sos = await SOSRequest.findById(sosId);
      if (sos) {
        let recipientToken = "";
        if (senderType === "client") {
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
            `🚨 SOS Msg: ${senderName}`,
            text.length > 60 ? `${text.substring(0, 60)}...` : text,
            { sosId, type: "sos_chat" }
          );
        }
      }
    } catch (notifErr) {
      console.error("Failed to send SOS chat push notification:", notifErr);
    }

    return NextResponse.json({ success: true, message: messageData });
  } catch (error: any) {
    console.error("SOS Chat Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send chat message", error: error.message },
      { status: 500 }
    );
  }
}

// GET: Fetch all messages for a given SOS
export async function GET(req: NextRequest) {
  try {
    const sosId = req.nextUrl.searchParams.get("sosId");

    if (!sosId) {
      return NextResponse.json(
        { success: false, message: "sosId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const messages = await SOSMessage.find({ sosId })
      .sort({ createdAt: 1 })
      .lean() as any[];

    const formatted = messages.map((m) => ({
      id: m._id.toString(),
      senderType: m.senderType,
      senderName: m.senderName,
      text: m.text,
      createdAt: m.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, messages: formatted });
  } catch (error: any) {
    console.error("SOS Chat History Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch chat history", error: error.message },
      { status: 500 }
    );
  }
}
