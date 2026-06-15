import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });

    // Teeno roles ki cookies ki list
    const cookiesToClear = [
      "client_auth_token",
      "advocate_auth_token",
      "admin_auth_token",
    ];

    // Bina condition check kiye sabhi ko ek sath expire (maxAge: 0) karo
    cookiesToClear.forEach((cookieName) => {
      response.cookies.set({
        name: cookieName,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0, // Turant expire karne ke liye
        path: "/",
      });
    });

    return response;

  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}