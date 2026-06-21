import { NextResponse } from "next/server";
import { pusher } from "@/utils/libs/pusher";

export async function POST(req: Request) {
  try {
    const { sosId, senderType, senderName, text } = await req.json();

    if (!sosId || !senderType || !senderName || !text) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Trigger Pusher event for real-time delivery
    await pusher.trigger(`sos-${sosId}`, "chat-message", {
      senderType,
      senderName,
      text,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("SOS Chat Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send chat message", error: error.message },
      { status: 500 }
    );
  }
}
