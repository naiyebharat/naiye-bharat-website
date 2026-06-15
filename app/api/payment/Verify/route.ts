import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/utils/dbConnect";
import Order from "@/utils/models/Order";
import ChatRoom from "@/utils/models/ChatRoom";
import Message from "@/utils/models/Message";
import Advocate from "@/utils/models/advocate";
import {
  sendClientOrderConfirmationEmail,
  sendExpertNewOrderEmail,
} from "@/utils/libs/mail";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, localOrderId } = await req.json();

    // 1. Signature Verify Karo (Security Check)
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const secret = process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_SECRET || "";
    const expectedSign = crypto
      .createHmac("sha256", secret)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Signature mismatch, transaction invalid." }, { status: 400 });
    }

    // 2. Order Database Entry Update
    const pendingOrder = await Order.findById(localOrderId);
    if (!pendingOrder) {
      return NextResponse.json({ success: false, error: "Order record not found in database." }, { status: 404 });
    }
    const shouldSendOrderEmails = pendingOrder.status !== "paid" && !pendingOrder.isVerified;

    // isVerified = true → prevents TTL deletion
    // sessionCost = pendingOrder.amount → saves paid cost to database
    // expireAt = undefined → MongoDB TTL index no longer targets this doc
    const order = await Order.findByIdAndUpdate(localOrderId, {
      $set: {
        status: "paid",
        paymentStatus: "paid",
        razorpayPaymentId: razorpay_payment_id,
        isVerified: true,
        sessionCost: pendingOrder.amount || 699,
      },
      $unset: { expireAt: "" }, // Remove TTL field — paid orders never expire
    }, { new: true });

    // Safety check — order must exist before creating ChatRoom
    if (!order) {
      return NextResponse.json({ success: false, error: "Order record not found in database." }, { status: 404 });
    }

    // 3. Dynamic Chat Room Stream Trigger Karo
    const newRoom = await ChatRoom.create({
      orderId: order._id,
      clientId: order.userId || "guest",
      expertId: order.expertId,
      status: "pending_expert",
    });

    // 4. Onboarding Chat Line Initialize Karo
    await Message.create({
      roomId: newRoom._id,
      senderType: "system",
      senderName: "NaiyeBharat Bot",
      text: "Aapka session token valid ho chuka hai. Hamare live expert panel ko message forward kar diya gaya hai. Kripya apna prashna niche type karein."
    });

    if (shouldSendOrderEmails) {
      const expert = order.expertId ? await Advocate.findById(order.expertId) : null;
      const orderEmailDetails = {
        orderId: String(order._id),
        paymentId: razorpay_payment_id,
        clientName: order.clientName,
        clientEmail: order.email,
        clientPhone: order.phoneNumber,
        expertName: expert?.name ? `Adv. ${expert.name}` : "Assigned Expert",
        specialty: order.specialty,
        language: order.language,
        amount: order.sessionCost || order.amount || 699,
        issueDescription: order.issueDescription,
      };

      const mailJobs = [];
      if (order.email) {
        mailJobs.push(sendClientOrderConfirmationEmail(order.email, orderEmailDetails));
      }
      if (expert?.email) {
        mailJobs.push(sendExpertNewOrderEmail(expert.email, orderEmailDetails));
      }

      const mailResults = await Promise.allSettled(mailJobs);
      const failedMails = mailResults.filter((result) => result.status === "rejected");
      if (failedMails.length > 0) {
        console.error("Order payment verified but one or more emails failed:", failedMails);
      }
    }

    return NextResponse.json({ success: true, roomId: newRoom._id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
