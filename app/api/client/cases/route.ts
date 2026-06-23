import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import Order from "@/utils/models/Order";
import ChatRoom from "@/utils/models/ChatRoom";
import Message from "@/utils/models/Message";
import "@/utils/models/advocate";
import { withAuth } from "@/utils/withAuth";

function getSpecialistName(id: string) {
  if (!id) return "Naiye Bharat Specialist";
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % 10) + 1;
  return `Naiye Bharat Specialist ${index}`;
}

export async function GET(req: NextRequest) {
  // ── Auth guard — only verified clients can access their own cases ──
  const auth = await withAuth(req, "client");
  if ("error" in auth) return auth.error;

  const { email } = auth.payload; // JWT se client ka email nikalo

  try {
    await connectDB();

    // 🔒 SCOPED: Sirf is client ke verified paid orders nikalenge (email se filter)
    const orders = await Order.find({ isVerified: true, email: email.toLowerCase().trim() })
      .populate("expertId", "name")
      .sort({ createdAt: -1 })
      .lean();

    const formattedCases = [];

    for (const order of orders as any[]) {
      let room = await ChatRoom.findOne({ orderId: order._id }).lean() as any;
      const targetRoomId = room ? room._id.toString() : order._id.toString();

      let snippet = "No connection payloads established yet.";
      let finalTimestamp = order.createdAt;

      if (room) {
        const lastMsg = await Message.findOne({ roomId: room._id })
          .sort({ createdAt: -1 })
          .lean() as any;

        if (lastMsg) {
          snippet = lastMsg.text.length > 45 ? `${lastMsg.text.substring(0, 45)}...` : lastMsg.text;
          finalTimestamp = lastMsg.createdAt;
        } else if (order.issueDescription) {
          snippet = order.issueDescription.length > 45 ? `${order.issueDescription.substring(0, 45)}...` : order.issueDescription;
        }
      } else if (order.issueDescription) {
        snippet = order.issueDescription.length > 45 ? `${order.issueDescription.substring(0, 45)}...` : order.issueDescription;
      }

      let mappedStatus: "ACTIVE" | "PENDING" | "COMPLETED" = "PENDING";
      if (room?.status === "active_discussion" || order.status === "paid") mappedStatus = "ACTIVE";
      if (room?.status === "closed") mappedStatus = "COMPLETED";

      formattedCases.push({
        id: targetRoomId,
        advocateName: order.expertId?._id 
          ? getSpecialistName(order.expertId._id.toString()) 
          : "Unassigned Node",
        specialty: order.specialty || "Legal Consultation",
        lastMessageSnippet: snippet,
        status: mappedStatus,
        timestamp: new Date(finalTimestamp).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        }).toLowerCase(),
        clientName: order.clientName || "Anonymous Client",
        clientAge: order.clientAge || 0,
        email: order.email || "No Email Provided",
        phoneNumber: order.phoneNumber || "N/A",
        language: order.language || "English",
        sessionCost: order.sessionCost || order.amount || 0,
        razorpayOrderId: order.razorpayOrderId || "N/A",
        issueDescription: order.issueDescription || ""
      });
    }

    return NextResponse.json({ success: true, cases: formattedCases }, { status: 200 });
  } catch (error: any) {
    console.error("Client cases fetch error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}