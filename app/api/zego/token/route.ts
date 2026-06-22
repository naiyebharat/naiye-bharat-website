import { NextRequest, NextResponse } from "next/server";
import { generateZegoToken04 } from "@/utils/zegoToken";

export async function GET(req: NextRequest) {
  const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
  const server = process.env.NEXT_PUBLIC_ZEGO_SERVER || "";
  const secret = process.env.ZEGO_SERVER_SECRET || "";
  const userId = req.nextUrl.searchParams.get("userId") || "";

  if (!appId || !server || !secret || !userId) {
    return NextResponse.json(
      { success: false, message: "Zego configuration is incomplete." },
      { status: 500 }
    );
  }

  const token = generateZegoToken04({
    appId,
    userId,
    secret,
    effectiveTimeInSeconds: 3600,
  });

  return NextResponse.json({ success: true, appId, server, token });
}
