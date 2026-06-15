import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/utils/dbConnect";
import User from "@/utils/models/User";
import Advocate from "@/utils/models/advocate";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password, redirectTo } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    let accountEntity: any = null;
    let designatedRole: "client" | "advocate" | "admin" = "client";
    let tokenName = "client_auth_token";
    let redirectPath = "/client";

    // ── Step 1: User collection check (client + admin) ────
    accountEntity = await User.findOne({ email: normalizedEmail }).select("+password");

    if (accountEntity) {
      designatedRole = accountEntity.role; // "client" | "admin" (DB se aayega)
    } else {
      // ── Step 2: Advocate collection check ───────────────
      accountEntity = await Advocate.findOne({ email: normalizedEmail }).select("+password");
      if (accountEntity) {
        // DB mein jo role hai wahi use karo — "advocate" ya "admin" dono possible hain
        designatedRole = accountEntity.role ?? "advocate";
      }
    }

    // Account exist nahi karta
    if (!accountEntity) {
      return NextResponse.json(
        { success: false, error: "No account found with this email." },
        { status: 401 }
      );
    }

    // ── Client verification gate ───────────────────────────
    // Sirf clients ke liye — advocates admin se bante hain toh pre-verified hain
    if (designatedRole === "client" && !accountEntity.isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "Please verify your email before logging in.",
          requiresVerification: true,
        },
        { status: 403 }
      );
    }

    // ── Password verify ────────────────────────────────────
    const isPasswordMatching = await bcrypt.compare(password, accountEntity.password);
    if (!isPasswordMatching) {
      return NextResponse.json(
        { success: false, error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    // ── Token + Redirect config based on role ─────────────
    if (redirectTo) {
      redirectPath = redirectTo;
      if (designatedRole === "admin") {
        tokenName = "admin_auth_token";
      } else if (designatedRole === "advocate") {
        tokenName = "advocate_auth_token";
      } else {
        tokenName = "client_auth_token";
      }
    } else if (designatedRole === "admin") {
      tokenName = "admin_auth_token";
      redirectPath = "/admin";
    } else if (designatedRole === "advocate") {
      tokenName = "advocate_auth_token";
      redirectPath = "/advocate";
    } else {
      tokenName = "client_auth_token";
      redirectPath = "/";
    }

    // ── JWT token create ───────────────────────────────────
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
      message: "Login successful.",
      role: designatedRole,
      redirect: redirectPath,
      user: {
        id: accountEntity._id,
        name: accountEntity.name,
        email: accountEntity.email,
        role: designatedRole,
      },
    });

    // ── HttpOnly cookie set ────────────────────────────────
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
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}