import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_PIPELINE_KEY_9999";
const secretKey = new TextEncoder().encode(JWT_SECRET);

// ────────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────────

async function verifyToken(token: string, expectedRole: string) {
  const { payload } = await jwtVerify(token, secretKey);
  if (payload.role !== expectedRole) throw new Error("wrong role");
  return payload;
}

function unauthorized(message = "Unauthorized: No valid session token.") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

function forbidden(message = "Forbidden: You do not have access to this resource.") {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

// ────────────────────────────────────────────────────────────────────────────────
// Middleware
// ────────────────────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const clientToken   = request.cookies.get("client_auth_token")?.value;
  const advocateToken = request.cookies.get("advocate_auth_token")?.value;
  const adminToken    = request.cookies.get("admin_auth_token")?.value;

  // ══════════════════════════════════════════════════════════════════════════════
  // ── API ROUTES — return JSON 401/403 (never redirect) ──────────────────────
  // ══════════════════════════════════════════════════════════════════════════════

  // /api/admin/* — requires admin_auth_token with role "admin"
  if (pathname.startsWith("/api/admin/")) {
    if (!adminToken) return unauthorized();
    try {
      await verifyToken(adminToken, "admin");
    } catch (e: any) {
      return e?.message === "wrong role" ? forbidden() : unauthorized("Unauthorized: Admin session expired or invalid.");
    }
    return NextResponse.next();
  }

  // /api/advocate/* — requires advocate_auth_token with role "advocate"
  if (pathname.startsWith("/api/advocate/")) {
    if (!advocateToken) return unauthorized();
    try {
      await verifyToken(advocateToken, "advocate");
    } catch (e: any) {
      return e?.message === "wrong role" ? forbidden() : unauthorized("Unauthorized: Advocate session expired or invalid.");
    }
    return NextResponse.next();
  }

  // /api/client/* — requires client_auth_token with role "client"
  if (pathname.startsWith("/api/client/")) {
    if (!clientToken) return unauthorized();
    try {
      await verifyToken(clientToken, "client");
    } catch (e: any) {
      return e?.message === "wrong role" ? forbidden() : unauthorized("Unauthorized: Client session expired or invalid.");
    }
    return NextResponse.next();
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // ── PAGE ROUTES — redirect to /login if unauthenticated ────────────────────
  // ══════════════════════════════════════════════════════════════════════════════

  // ── Guard pages to keep admin/advocate strictly inside their respective panels ──
  if (!pathname.startsWith("/api/")) {
    if (adminToken) {
      try {
        await verifyToken(adminToken, "admin");
        if (!pathname.startsWith("/admin")) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      } catch {}
    }
    if (advocateToken) {
      try {
        await verifyToken(advocateToken, "advocate");
        if (!pathname.startsWith("/advocate")) {
          return NextResponse.redirect(new URL("/advocate", request.url));
        }
      } catch {}
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!adminToken) return NextResponse.redirect(new URL("/login", request.url));
    try {
      await verifyToken(adminToken, "admin");
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/advocate")) {
    if (!advocateToken) return NextResponse.redirect(new URL("/login", request.url));
    try {
      await verifyToken(advocateToken, "advocate");
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/client")) {
    if (!clientToken) return NextResponse.redirect(new URL("/login", request.url));
    try {
      await verifyToken(clientToken, "client");
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ── Already logged in → redirect to dashboard/home ─────────────────────────
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (adminToken) {
      try { await verifyToken(adminToken, "admin"); return NextResponse.redirect(new URL("/admin", request.url)); } catch {}
    }
    if (advocateToken) {
      try { await verifyToken(advocateToken, "advocate"); return NextResponse.redirect(new URL("/advocate", request.url)); } catch {}
    }
    if (clientToken) {
      try { await verifyToken(clientToken, "client"); return NextResponse.redirect(new URL("/", request.url)); } catch {}
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|img|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|PNG|JPG|JPEG)$).*)",
  ],
};