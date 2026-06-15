import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import ChatRoom from "@/utils/models/ChatRoom";
import Message from "@/utils/models/Message";
import Order from "@/utils/models/Order";
import { withAuth } from "@/utils/withAuth";

export async function GET(req: NextRequest) {
  // ── Auth guard — only verified advocates can access their own rooms ──
  const auth = await withAuth(req, "advocate");
  if ("error" in auth) return auth.error;

  const advocateId = auth.payload.id; // JWT se advocate ka MongoDB _id

  try {
    await connectDB();

    // 🔒 SCOPED: Sirf is advocate ke assigned ChatRooms fetch karenge
    const rooms = await ChatRoom.find({ expertId: advocateId })
      .sort({ updatedAt: -1 })
      .lean();

    if (!rooms || rooms.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const enriched: any[] = [];

    for (const room of rooms as any[]) {
      // Check order payment status — SKIP if not paid/verified
      const order = await Order.findById(room.orderId).lean() as any;

      if (!order || !order.isVerified) {
        // Unpaid / unverified order — skip entirely
        continue;
      }

      // Get last message preview
      const lastMsg = await Message.findOne({ roomId: room._id })
        .sort({ createdAt: -1 })
        .lean() as any;

      const realClientName = order.clientName || order.name || room.clientId || "Anonymous Client";

      enriched.push({
        id: room._id.toString(),
        roomId: room._id.toString(),
        clientId: room.clientId || "Unknown",
        name: realClientName,
        issue: order.issueDescription || order.legalArea || "Legal Consultation",
        status: room.status || "pending_expert",
        isAssigned: room.isAssigned,
        lastMessage: lastMsg?.text || "Session started.",
        lastMessageTime: lastMsg?.createdAt
          ? new Date(lastMsg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
          : new Date(room.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        createdAt: room.createdAt,
      });
    }

    return NextResponse.json({ success: true, data: enriched });
  } catch (err: any) {
    console.error("Advocate rooms fetch error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await withAuth(req, "advocate");
  if ("error" in auth) return auth.error;

  try {
    await connectDB();
    const { roomId, status } = await req.json();

    if (!roomId || !status) {
      return NextResponse.json({ success: false, error: "roomId and status are required." }, { status: 400 });
    }

    const updated = await ChatRoom.findByIdAndUpdate(
      roomId,
      { status, isAssigned: true },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Room not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("Room PATCH error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}