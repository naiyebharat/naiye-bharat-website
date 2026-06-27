import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/utils/dbConnect";
import User from "@/utils/models/User";
import Advocate from "@/utils/models/advocate";
import Otp from "@/utils/models/Otp";
import { sendOtpEmail } from "@/utils/libs/mail";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { action, email, otp, password } = body;

    if (!action || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ══════════════════════════════════════════
    // ACTION 1: send-otp
    // ══════════════════════════════════════════
    if (action === "send-otp") {
      // Check if email exists in User or Advocate database
      const userExists = await User.findOne({ email: normalizedEmail });
      const advocateExists = await Advocate.findOne({ email: normalizedEmail });

      if (!userExists && !advocateExists) {
        return NextResponse.json(
          { success: false, error: "No account found with this email address." },
          { status: 404 }
        );
      }

      // Generate and hash OTP
      const generatedOTP = generateOTP();
      const hashedOTP = await bcrypt.hash(generatedOTP, 10);

      // Save OTP to Otp collection (TTL is 10 minutes, defined in schema)
      await Otp.findOneAndUpdate(
        { email: normalizedEmail },
        { otp: hashedOTP, createdAt: new Date() },
        { upsert: true, new: true }
      );

      // Dispatch mail using nodemailer
      await sendOtpEmail(normalizedEmail, generatedOTP);

      return NextResponse.json({
        success: true,
        message: `A security code has been sent to ${normalizedEmail}.`,
      });
    }

    // ══════════════════════════════════════════
    // ACTION 2: verify-otp
    // ══════════════════════════════════════════
    if (action === "verify-otp") {
      if (!otp) {
        return NextResponse.json(
          { success: false, error: "Verification code is required." },
          { status: 400 }
        );
      }

      const otpRecord = await Otp.findOne({ email: normalizedEmail });
      if (!otpRecord) {
        return NextResponse.json(
          { success: false, error: "Verification session expired or invalid email." },
          { status: 404 }
        );
      }

      const isOTPValid = await bcrypt.compare(otp, otpRecord.otp);
      if (!isOTPValid) {
        return NextResponse.json(
          { success: false, error: "Invalid verification code. Please try again." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Verification code validated successfully.",
      });
    }

    // ══════════════════════════════════════════
    // ACTION 3: reset-password
    // ══════════════════════════════════════════
    if (action === "reset-password") {
      if (!otp || !password) {
        return NextResponse.json(
          { success: false, error: "Verification code and new password are required." },
          { status: 400 }
        );
      }

      // Re-verify code for security
      const otpRecord = await Otp.findOne({ email: normalizedEmail });
      if (!otpRecord) {
        return NextResponse.json(
          { success: false, error: "Session expired. Please request a new OTP." },
          { status: 404 }
        );
      }

      const isOTPValid = await bcrypt.compare(otp, otpRecord.otp);
      if (!isOTPValid) {
        return NextResponse.json(
          { success: false, error: "Invalid verification code." },
          { status: 400 }
        );
      }

      // Find user in collections
      let user = await User.findOne({ email: normalizedEmail });
      let advocate = await Advocate.findOne({ email: normalizedEmail });

      if (!user && !advocate) {
        return NextResponse.json(
          { success: false, error: "Target account not found." },
          { status: 404 }
        );
      }

      if (user) {
        // Hash and update User password manually (User schema has no pre-save hook)
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        await user.save();
      }

      if (advocate) {
        // Set password on Advocate instance (Advocate has pre-save hook to hash it)
        advocate.password = password;
        await advocate.save();
      }

      // Delete the OTP record upon successful password reset
      await Otp.deleteOne({ email: normalizedEmail });

      return NextResponse.json({
        success: true,
        message: "Your password has been successfully configured.",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action routing requested." },
      { status: 400 }
    );

  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
