import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/utils/dbConnect";
import User from "@/utils/models/User";
import Advocate from "@/utils/models/advocate";

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_PIPELINE_KEY_9999";

export async function GET(req: NextRequest) {
  try {
    const clientToken   = req.cookies.get("client_auth_token")?.value;
    const advocateToken = req.cookies.get("advocate_auth_token")?.value;
    const adminToken    = req.cookies.get("admin_auth_token")?.value;

    const token = clientToken || advocateToken || adminToken;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated. Session token missing." },
        { status: 401 }
      );
    }

    await connectDB();

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Retrieve fresh details from DB to keep the UI updated dynamically
    let userDetails = { name: decoded.name, email: decoded.email, role: decoded.role };

    if (decoded.role === "advocate") {
      const advocate = await Advocate.findById(decoded.id);
      if (advocate) {
        userDetails.name = advocate.name;
      }
    } else {
      const user = await User.findById(decoded.id);
      if (user) {
        userDetails.name = user.name;
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: userDetails.name,
      },
    });
  } catch (error: any) {
    console.error("Profile GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed. Invalid session." },
      { status: 401 }
    );
  }
}
