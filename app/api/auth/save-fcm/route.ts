import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import User from "@/utils/models/User";
import Advocate from "@/utils/models/advocate";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, role, fcmToken } = body;

    if (!userId || !fcmToken) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId, fcmToken" },
        { status: 400 }
      );
    }

    if (role === "advocate") {
      await Advocate.findByIdAndUpdate(userId, { fcmToken });
    } else {
      await User.findByIdAndUpdate(userId, { fcmToken });
    }

    return NextResponse.json({ success: true, message: "FCM token saved successfully" });
  } catch (error: any) {
    console.error("Save FCM Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
