import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/utils/dbConnect";
import Order from "@/utils/models/Order";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Lazy initialize Razorpay inside request handler to guarantee environment variables are fully loaded
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_SECRET || "",
    });

    const { orderId, userId, email, expertId, pricing } = await req.json();

    // 1. Razorpay checkout order payload setup
    const options = {
      amount: pricing * 100, // paise mein leta hai
      currency: "INR",
      receipt: `receipt_exp_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 2. Apne DB mein draft record entry save karo (ya existing intake order update karo)
    // expireAt = 3 days from now — TTL index will auto-delete if payment never happens (3 * 24 * 60 * 60 * 1000 ms)
    const expireAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    let localOrder;
    if (orderId) {
      localOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          userId,
          email: email ? email.toLowerCase().trim() : undefined,
          expertId,
          amount: pricing,
          razorpayOrderId: razorpayOrder.id,
          status: "created",
          isVerified: false,
          expireAt, // Reset TTL window on each attempt
        },
        { new: true }
      );
    }

    if (!localOrder) {
      localOrder = await Order.create({
        userId,
        email: email ? email.toLowerCase().trim() : undefined,
        expertId,
        amount: pricing,
        razorpayOrderId: razorpayOrder.id,
        status: "created",
        isVerified: false,
        expireAt,
      });
    }

    return NextResponse.json({ success: true, order: razorpayOrder, localOrderId: localOrder._id });
  } catch (error: any) {
    console.error("Razorpay order creation crash:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}