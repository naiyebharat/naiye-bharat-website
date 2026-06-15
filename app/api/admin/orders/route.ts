import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import Order from "@/utils/models/Order"; // Aapka order model path

// 1. Aapka purana GET method yahan chal raha hoga...
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate("expertId");
    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. 🔥 NEW: Status Update karne ke liye PUT method
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    // Body se data nikalenge
    const body = await req.json();
    const { orderId, consultationStatus } = body;

    // Validation
    if (!orderId || !consultationStatus) {
      return NextResponse.json(
        { success: false, error: "Order ID and Consultation Status are required." },
        { status: 400 }
      );
    }

    // Status check validation
    if (!["pending", "completed"].includes(consultationStatus)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value. Use 'pending' or 'completed'." },
        { status: 400 }
      );
    }

    // Database me update query execute karenge
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { consultationStatus: consultationStatus },
      { new: true } // Taaki updated data return ho
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: `Order status successfully updated to ${consultationStatus}`, 
        data: updatedOrder 
      }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Admin Order Update API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while updating status." },
      { status: 500 }
    );
  }
}