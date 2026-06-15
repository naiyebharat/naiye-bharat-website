import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/utils/dbConnect";
import User from "@/utils/models/User";
import Advocate from "@/utils/models/advocate";

const JWT_SECRET = process.env.JWT_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { token } = body; // Frontend se Google idToken aayega

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Google token is missing." },
        { status: 400 }
      );
    }

    // 1. Google ke tokeninfo endpoint se token ko verify karna
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const googleData = await googleRes.json();

    if (googleData.error_description) {
      return NextResponse.json(
        { success: false, error: "Invalid Google Token." },
        { status: 400 }
      );
    }

    // Client ID verification security check
    if (googleData.aud !== GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { success: false, error: "Token audience mismatch. Security alert." },
        { status: 403 }
      );
    }

    const { email, name, sub: googleId, picture } = googleData;
    const normalizedEmail = email.toLowerCase().trim();

    let accountEntity: any = null;
    let designatedRole: "client" | "advocate" | "admin" = "client";
    let tokenName = "client_auth_token";
    let redirectPath = "/";

    // 2. Check karo kya yeh email pehle se exist karta hai?
    // Pehle User collection (client/admin) check karte hain
    accountEntity = await User.findOne({ email: normalizedEmail });

    if (accountEntity) {
      designatedRole = accountEntity.role;
      
      // Agar user pehle se hai par usne pehle Google connect nahi kiya tha, toh link kar do
      if (!accountEntity.googleId) {
        accountEntity.googleId = googleId;
      }
      
      // Agar user OTP verification phase mein latka tha, toh ab verify ho gaya!
      if (!accountEntity.isVerified) {
        accountEntity.isVerified = true;
        accountEntity.deleteAt = undefined; // TTL index hatao taaki delete na ho
        accountEntity.otp = undefined;
        accountEntity.otpExpiry = undefined;
      }
      
      if (picture && !accountEntity.avatar) {
        accountEntity.avatar = picture;
      }
      
      await accountEntity.save();
    } else {
      // Agar User mein nahi mila, toh Advocate collection mein check karo
      accountEntity = await Advocate.findOne({ email: normalizedEmail });
      
      if (accountEntity) {
        designatedRole = accountEntity.role ?? "advocate";
      } else {
        // 3. Agar kahin nahi mila toh NAYA CLIENT ACCOUNT banao (Auto-Verified)
        accountEntity = await User.create({
          name,
          email: normalizedEmail,
          googleId,
          role: "client",
          isVerified: true, // Google verified hai toh direct true
          avatar: picture || "",
          deleteAt: undefined, // No TTL for Google signup
        });
        designatedRole = "client";
      }
    }

    // 4. Role ke hisab se Routing and Cookie Name set karo (Aapke login route jaisa same)
    if (designatedRole === "admin") {
      tokenName = "admin_auth_token";
      redirectPath = "/admin";
    } else if (designatedRole === "advocate") {
      tokenName = "advocate_auth_token";
      redirectPath = "/advocate";
    } else {
      tokenName = "client_auth_token";
      redirectPath = "/";
    }

    // 5. JWT token generate karo
    const sessionToken = jwt.sign(
      {
        id: accountEntity._id,
        email: accountEntity.email,
        role: designatedRole,
        name: accountEntity.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      message: "Google authentication successful.",
      role: designatedRole,
      redirect: redirectPath,
      user: {
        id: accountEntity._id,
        name: accountEntity.name,
        email: accountEntity.email,
        role: designatedRole,
      },
    });

    // 6. HttpOnly cookie set karo
    response.cookies.set({
      name: tokenName,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;

  } catch (error: any) {
    console.error("Google Auth Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during Google authentication." },
      { status: 500 }
    );
  }
}