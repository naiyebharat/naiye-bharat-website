import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import Message from "@/utils/models/Message";
import ChatRoom from "@/utils/models/ChatRoom";

// GET /api/chat/messages?roomId=xxx
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json({ success: false, error: "roomId is required" }, { status: 400 });
    }

    const messages = await Message.find({ roomId }).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/chat/messages
// Body: { roomId, text, senderType, senderName }
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { roomId, text, senderType, senderName } = await req.json();

    if (!roomId || !text || !senderType || !senderName) {
      return NextResponse.json({ success: false, error: "roomId, text, senderType, senderName are required" }, { status: 400 });
    }

    const message = await Message.create({ roomId, text, senderType, senderName });
    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
