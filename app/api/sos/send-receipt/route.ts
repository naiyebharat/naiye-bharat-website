import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      clientName: string;
      clientEmail: string;
      paymentId: string;
      orderId: string;
      amountPaid: number;
      emergencyType: string;
      sosId: string;
    };

    const { clientName, clientEmail, paymentId, orderId, amountPaid, emergencyType, sosId } = body;

    if (!clientName || !clientEmail || !paymentId || !orderId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // If email creds are missing, skip silently
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("[SOS Receipt] EMAIL_USER or EMAIL_PASS not configured. Skipping email.");
      return NextResponse.json({ success: true, message: "Email bypassed (credentials missing)" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const paymentDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const amountFormatted = `₹${amountPaid.toLocaleString("en-IN")}.00`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SOS Payment Confirmation – NaiyeBharat</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0f1c;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0b0f1c;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:620px;background-color:#111827;border-radius:20px;overflow:hidden;border:1px solid #1f2937;">

          <!-- ── HEADER BANNER ── -->
          <tr>
            <td style="background:linear-gradient(135deg,#7f1d1d 0%,#991b1b 50%,#7f1d1d 100%);padding:36px 40px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <!-- SOS Shield Icon -->
                    <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:16px;border:1px solid rgba(255,255,255,0.25);text-align:center;line-height:56px;font-size:26px;">
                      ⚖️
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">NaiyeBharat</h1>
                    <p style="margin:6px 0 0;color:#fca5a5;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;">Emergency Legal Response</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── SUCCESS BADGE ── -->
          <tr>
            <td align="center" style="padding:32px 40px 0;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#14532d;border:1px solid #166534;border-radius:100px;padding:8px 20px;">
                    <span style="color:#4ade80;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">✓ &nbsp; Payment Confirmed</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── GREETING ── -->
          <tr>
            <td style="padding:24px 40px 0;">
              <h2 style="margin:0;color:#f9fafb;font-size:20px;font-weight:700;">Dear ${clientName},</h2>
              <p style="margin:12px 0 0;color:#9ca3af;font-size:14px;line-height:1.7;">
                Your SOS Emergency Legal Assistance request has been <strong style="color:#f9fafb;">successfully activated</strong>. 
                We have received your payment and are dispatching the nearest verified advocate to your location immediately.
              </p>
            </td>
          </tr>

          <!-- ── DIVIDER ── -->
          <tr><td style="padding:24px 40px;"><hr style="border:none;border-top:1px solid #1f2937;" /></td></tr>

          <!-- ── TRANSACTION DETAILS ── -->
          <tr>
            <td style="padding:0 40px;">
              <h3 style="margin:0 0 16px;color:#ef4444;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Transaction Details</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:14px;overflow:hidden;border:1px solid #374151;">
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #374151;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td style="color:#6b7280;font-size:12px;font-weight:600;">SOS Request ID</td>
                      <td align="right" style="color:#f9fafb;font-size:12px;font-weight:700;font-family:monospace;">#${sosId.slice(-8).toUpperCase()}</td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #374151;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td style="color:#6b7280;font-size:12px;font-weight:600;">Payment Date</td>
                      <td align="right" style="color:#f9fafb;font-size:12px;font-weight:700;">${paymentDate}</td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #374151;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td style="color:#6b7280;font-size:12px;font-weight:600;">Amount Paid</td>
                      <td align="right" style="color:#4ade80;font-size:14px;font-weight:800;">${amountFormatted}</td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #374151;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td style="color:#6b7280;font-size:12px;font-weight:600;">Payment Gateway</td>
                      <td align="right" style="color:#f9fafb;font-size:12px;font-weight:700;">Razorpay (Secured)</td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #374151;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td style="color:#6b7280;font-size:12px;font-weight:600;">Transaction ID</td>
                      <td align="right" style="color:#f9fafb;font-size:11px;font-weight:700;font-family:monospace;">${paymentId}</td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td style="color:#6b7280;font-size:12px;font-weight:600;">Order ID</td>
                      <td align="right" style="color:#f9fafb;font-size:11px;font-weight:700;font-family:monospace;">${orderId}</td>
                    </tr></table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── DIVIDER ── -->
          <tr><td style="padding:24px 40px;"><hr style="border:none;border-top:1px solid #1f2937;" /></td></tr>

          <!-- ── SERVICE SUMMARY ── -->
          <tr>
            <td style="padding:0 40px;">
              <h3 style="margin:0 0 16px;color:#ef4444;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Service Summary</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:14px;overflow:hidden;border:1px solid #374151;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #374151;">
                    <p style="margin:0;color:#f9fafb;font-size:13px;font-weight:700;">🚨 SOS Emergency Legal Assistance</p>
                    <p style="margin:4px 0 0;color:#6b7280;font-size:12px;">Category: ${emergencyType}</p>
                    <p style="margin:3px 0 0;color:#6b7280;font-size:12px;">Nearest verified advocate being dispatched · Live tracking enabled</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;background:#1a2436;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td style="color:#9ca3af;font-size:13px;font-weight:700;">Total Charged</td>
                      <td align="right" style="color:#4ade80;font-size:16px;font-weight:800;">${amountFormatted}</td>
                    </tr></table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── WHAT HAPPENS NEXT ── -->
          <tr>
            <td style="padding:24px 40px 0;">
              <h3 style="margin:0 0 16px;color:#ef4444;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">What Happens Next</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="width:32px;height:32px;background:#1f2937;border-radius:50%;text-align:center;line-height:32px;color:#ef4444;font-size:14px;font-weight:800;flex-shrink:0;">1</td>
                      <td style="padding-left:14px;color:#9ca3af;font-size:13px;line-height:1.6;">The nearest verified SOS-certified advocate has been notified and is reviewing your case.</td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="width:32px;height:32px;background:#1f2937;border-radius:50%;text-align:center;line-height:32px;color:#ef4444;font-size:14px;font-weight:800;">2</td>
                      <td style="padding-left:14px;color:#9ca3af;font-size:13px;line-height:1.6;">Once accepted, you will receive the advocate's details and can track their live location on the map.</td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="width:32px;height:32px;background:#1f2937;border-radius:50%;text-align:center;line-height:32px;color:#ef4444;font-size:14px;font-weight:800;">3</td>
                      <td style="padding-left:14px;color:#9ca3af;font-size:13px;line-height:1.6;">Use in-app live chat and voice/video call to communicate with your counsel before they arrive.</td>
                    </tr></table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── DIVIDER ── -->
          <tr><td style="padding:24px 40px;"><hr style="border:none;border-top:1px solid #1f2937;" /></td></tr>

          <!-- ── SUPPORT NOTE ── -->
          <tr>
            <td style="padding:0 40px 24px;">
              <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.7;">
                If you require a copy of your invoice or have any questions regarding this SOS request, 
                please contact our support team at 
                <a href="mailto:support@naiyebharat.com" style="color:#ef4444;text-decoration:none;font-weight:600;">support@naiyebharat.com</a>.
              </p>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background:#0b0f1c;padding:28px 40px;border-top:1px solid #1f2937;text-align:center;">
              <p style="margin:0 0 6px;color:#f9fafb;font-size:13px;font-weight:700;">NaiyeBharat Legal Services</p>
              <p style="margin:0 0 12px;color:#6b7280;font-size:12px;">
                <a href="mailto:support@naiyebharat.com" style="color:#6b7280;text-decoration:none;">support@naiyebharat.com</a>
                &nbsp;·&nbsp;
                <a href="https://naiyebharat.com" style="color:#6b7280;text-decoration:none;">naiyebharat.com</a>
              </p>
              <p style="margin:0;color:#374151;font-size:11px;">
                © ${new Date().getFullYear()} NaiyeBharat Pvt. Ltd. · MSME Registered · Certified Legal Platform
              </p>
              <p style="margin:8px 0 0;color:#374151;font-size:10px;">
                This is an automated transaction receipt. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

    await transporter.sendMail({
      from: `"NaiyeBharat Emergency Legal" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `🚨 SOS Payment Confirmed – NaiyeBharat Emergency #${sosId.slice(-8).toUpperCase()}`,
      html,
    });

    return NextResponse.json({ success: true, message: "SOS receipt email sent successfully" });
  } catch (error: unknown) {
    console.error("[SOS Receipt] Error sending email:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: "Failed to send receipt email", error: msg },
      { status: 500 }
    );
  }
}
