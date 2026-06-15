import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_PIPELINE_KEY_9999";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export type AuthRole = "admin" | "advocate" | "client";

const COOKIE_MAP: Record<AuthRole, string> = {
  admin: "admin_auth_token",
  advocate: "advocate_auth_token",
  client: "client_auth_token",
};

export interface AuthPayload {
  id: string;
  email: string;
  role: AuthRole;
  name: string;
}

/**
 * Call at the top of any API route handler to verify the caller's identity.
 *
 * @param req      - The incoming NextRequest
 * @param role     - The required role: "admin" | "advocate" | "client"
 * @returns        - { payload } on success, or { error } (a ready-to-return NextResponse) on failure
 *
 * Usage:
 *   const auth = await withAuth(req, "admin");
 *   if ("error" in auth) return auth.error;
 *   const { payload } = auth; // payload.id, payload.email, etc.
 */
export async function withAuth(
  req: NextRequest,
  role: AuthRole
): Promise<{ payload: AuthPayload } | { error: NextResponse }> {
  const cookieName = COOKIE_MAP[role];
  const token = req.cookies.get(cookieName)?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        { success: false, error: "Unauthorized: No session token found." },
        { status: 401 }
      ),
    };
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);

    // Extra role check — in case a client token is sent to an admin route, etc.
    if (payload.role !== role) {
      return {
        error: NextResponse.json(
          { success: false, error: "Forbidden: Insufficient permissions." },
          { status: 403 }
        ),
      };
    }

    return { payload: payload as unknown as AuthPayload };
  } catch {
    return {
      error: NextResponse.json(
        { success: false, error: "Unauthorized: Session expired or invalid token." },
        { status: 401 }
      ),
    };
  }
}
