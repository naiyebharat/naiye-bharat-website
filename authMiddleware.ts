import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose"; // Edge runtime safe

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "SUPER_SECRET_PIPELINE_KEY_9999"
);

type Role = "client" | "advocate" | "admin";

// Cookie name → role mapping
const COOKIE_ROLE_MAP: Record<string, Role> = {
  client_auth_token:   "client",
  advocate_auth_token: "advocate",
  admin_auth_token:    "admin",
};

interface AuthPayload {
  id: string;
  email: string;
  role: Role;
  name: string;
}

// ── Token extract + verify helper ─────────────────────────
async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

// ── Main wrapper — route handler ke upar lagao ────────────
export function withAuth(
  handler: (req: NextRequest, user: AuthPayload) => Promise<NextResponse>,
  allowedRoles?: Role[] // undefined = koi bhi valid token chalega
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    let token: string | undefined;
    let payload: AuthPayload | null = null;

    // 1. Teeno cookies check karo — jo bhi mili use verify karo
    for (const [cookieName, role] of Object.entries(COOKIE_ROLE_MAP)) {
      const cookieValue = req.cookies.get(cookieName)?.value;
      if (cookieValue) {
        const verified = await verifyToken(cookieValue);
        if (verified) {
          payload = verified;
          break;
        }
      }
    }

    // 2. Cookie nahi mili toh Authorization header check karo
    if (!payload) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
        payload = await verifyToken(token);
      }
    }

    // 3. Koi valid token nahi mila
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    // 4. Role check — agar allowedRoles diya hai
    if (allowedRoles && !allowedRoles.includes(payload.role)) {
      return NextResponse.json(
        { success: false, error: "Access denied. Insufficient permissions." },
        { status: 403 }
      );
    }

    // 5. Sab valid — handler call karo, user payload saath bhejo
    return handler(req, payload);
  };
}