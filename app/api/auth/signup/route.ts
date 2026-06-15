import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/utils/dbConnect";
import User from "@/utils/models/User";
import { sendOtpEmail, sendWelcomeEmail } from "@/utils/libs/mail"; // ← bas yahi import

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { action, name, email, password, otp } = body;

    if (!action || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ══════════════════════════════════════════
    // ACTION 1: get-otp
    // ══════════════════════════════════════════
    if (action === "get-otp") {
      if (!name || !password) {
        return NextResponse.json(
          { success: false, error: "Name and password are required." },
          { status: 400 }
        );
      }

      const existingUser = await User.findOne({ email: normalizedEmail });

      if (existingUser && existingUser.isVerified) {
        return NextResponse.json(
          { success: false, error: "Email already registered. Please login." },
          { status: 409 }
        );
      }

      const generatedOTP = generateOTP();
      const hashedOTP = await bcrypt.hash(generatedOTP, 10);
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      const deleteAt = new Date(Date.now() + 10 * 60 * 1000);
      const hashedPassword = await bcrypt.hash(password, 12);

      if (existingUser && !existingUser.isVerified) {
        // Unverified user — OTP refresh karo
        existingUser.name = name;
        existingUser.password = hashedPassword;
        existingUser.otp = hashedOTP;
        existingUser.otpExpiry = otpExpiry;
        existingUser.deleteAt = deleteAt;
        await existingUser.save();
      } else {
        // Naya user
        await User.create({
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: "client",
          isVerified: false,
          otp: hashedOTP,
          otpExpiry,
          deleteAt,
        });
      }

      // ✅ Tera existing mail.js use karo — transporter sab handle karega
      await sendOtpEmail(normalizedEmail, generatedOTP);

      return NextResponse.json({
        success: true,
        message: `Verification code sent to ${normalizedEmail}. Valid for 10 minutes.`,
      });
    }

    // ══════════════════════════════════════════
    // ACTION 2: verify-otp
    // ══════════════════════════════════════════
    if (action === "verify-otp") {
      if (!otp) {
        return NextResponse.json(
          { success: false, error: "OTP is required." },
          { status: 400 }
        );
      }

      const user = await User.findOne({ email: normalizedEmail }).select(
        "+otp +otpExpiry"
      );

      if (!user) {
        return NextResponse.json(
          { success: false, error: "Session expired. Please request a new OTP." },
          { status: 404 }
        );
      }

      if (user.isVerified) {
        return NextResponse.json(
          { success: false, error: "Account already verified. Please login." },
          { status: 400 }
        );
      }

      if (!user.otpExpiry || new Date() > user.otpExpiry) {
        return NextResponse.json(
          { success: false, error: "OTP expired. Please request a new one." },
          { status: 400 }
        );
      }

      const isOTPValid = await bcrypt.compare(otp, user.otp!);
      if (!isOTPValid) {
        return NextResponse.json(
          { success: false, error: "Invalid OTP. Please try again." },
          { status: 400 }
        );
      }

      // ✅ Verified — cleanup karo
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      user.deleteAt = undefined; // TTL hata do — permanent account
      await user.save();

      // ✅ Welcome email bhi bhejo
      await sendWelcomeEmail(normalizedEmail, user.name);

      return NextResponse.json({
        success: true,
        message: "Email verified successfully! You can now login.",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action." },
      { status: 400 }
    );

  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}