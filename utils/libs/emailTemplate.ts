// @ts-nocheck

// Send email otp template
export const sendEmailOtpTemplate = (otp) => { 
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0; padding:0; background-color:#0f0f1a; font-family: Arial, sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="500" cellpadding="0" cellspacing="0" style="background-color:#1a1a2e; border-radius:16px; overflow:hidden; max-width:500px; width:100%;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="padding: 36px 40px 28px; background-color:#1a1a2e; border-bottom: 1px solid #2a2a4a;">
                <div style="background-color:#00c2a8; width:52px; height:52px; border-radius:14px; display:inline-block; line-height:52px; text-align:center; font-size:26px; font-weight:800; color:#050b1d; margin-bottom:14px;">
                  N
                </div>
                <br>
                <span style="color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.5px;">Naiye<span style="color:#00c2a8;">Bharat</span></span>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 36px 40px 20px;">
                <p style="color:#a0a0c0; font-size:15px; margin:0 0 8px 0;">Hello 👋</p>
                <p style="color:#ffffff; font-size:16px; font-weight:600; margin:0 0 24px 0;">
                  Your verification code for Naiye Bharat is:
                </p>

                <!-- OTP Box -->
                <div style="background-color:#0f0f23; border:1px solid #00c2a8; border-radius:12px; padding:28px; text-align:center; margin-bottom:24px;">
                  <span style="color:#00c2a8; font-size:42px; font-weight:800; letter-spacing:12px;">
                    ${otp}
                  </span>
                </div>

                <p style="color:#a0a0c0; font-size:13px; margin:0 0 8px 0;">
                  ⏰ This code will expire in <strong style="color:#ffffff;">10 minutes</strong>
                </p>
                <p style="color:#a0a0c0; font-size:13px; margin:0;">
                  🔒 Do not share this code with anyone
                </p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding: 0 40px;">
                <div style="height:1px; background-color:#2a2a4a;"></div>
              </td>
            </tr>

            <!-- Warning -->
            <tr>
              <td style="padding: 20px 40px;">
                <div style="background-color:#2a1a1a; border-left:3px solid #ff6b6b; border-radius:6px; padding:12px 16px;">
                  <p style="color:#ff9a9a; font-size:12px; margin:0;">
                    ⚠️ If you did not request this, please ignore this email and secure your account immediately.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding: 20px 40px 32px;">
                <p style="color:#555577; font-size:12px; margin:0;">
                  © 2026 Naiye Bharat. Made with ❤️ in India
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};

export const sendWelcomeEmailTemplate = (firstName) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0; padding:0; background-color:#0f0f1a; font-family: Arial, sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="500" cellpadding="0" cellspacing="0" style="background-color:#1a1a2e; border-radius:16px; overflow:hidden; max-width:500px; width:100%;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="padding: 36px 40px 28px; background-color:#1a1a2e; border-bottom: 1px solid #2a2a4a;">
                <div style="background-color:#00c2a8; width:52px; height:52px; border-radius:14px; display:inline-block; line-height:52px; text-align:center; font-size:26px; font-weight:800; color:#050b1d; margin-bottom:14px;">
                  N
                </div>
                <br>
                <span style="color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.5px;">Naiye<span style="color:#00c2a8;">Bharat</span></span>
              </td>
            </tr>

            <!-- Hero Section -->
            <tr>
              <td align="center" style="padding: 40px 40px 20px;">
                <div style="font-size:48px; margin-bottom:16px;">🏛️</div>
                <h1 style="color:#ffffff; font-size:24px; font-weight:800; margin:0 0 10px 0;">
                  Welcome to Naiye Bharat!
                </h1>
                <p style="color:#a0a0c0; font-size:15px; margin:0;">
                  Hey <strong style="color:#00c2a8;">${firstName}</strong>! You are now part of the Naiye Bharat legal portal.
                </p>
              </td>
            </tr>

            <!-- Features -->
            <tr>
              <td style="padding: 20px 40px;">

                <!-- Feature 1 -->
                <div style="background-color:#0f0f23; border-radius:12px; padding:16px 20px; margin-bottom:12px;">
                  <div style="display:inline-block; background-color:#1a1a3a; border-radius:10px; padding:10px; margin-right:16px; vertical-align:middle;">
                    <span style="font-size:22px;">⚖️</span>
                  </div>
                  <div style="display:inline-block; vertical-align:middle;">
                    <p style="color:#ffffff; font-size:14px; font-weight:600; margin:0 0 4px 0;">Legal Consultation</p>
                    <p style="color:#a0a0c0; font-size:12px; margin:0;">Connect with experts instantly</p>
                  </div>
                </div>

                <!-- Feature 2 -->
                <div style="background-color:#0f0f23; border-radius:12px; padding:16px 20px; margin-bottom:12px;">
                  <div style="display:inline-block; background-color:#1a1a3a; border-radius:10px; padding:10px; margin-right:16px; vertical-align:middle;">
                    <span style="font-size:22px;">📱</span>
                  </div>
                  <div style="display:inline-block; vertical-align:middle;">
                    <p style="color:#ffffff; font-size:14px; font-weight:600; margin:0 0 4px 0;">Unified Portal</p>
                    <p style="color:#a0a0c0; font-size:12px; margin:0;">Access your workspace on phone and browser</p>
                  </div>
                </div>

                <!-- Feature 3 -->
                <div style="background-color:#0f0f23; border-radius:12px; padding:16px 20px; margin-bottom:12px;">
                  <div style="display:inline-block; background-color:#1a1a3a; border-radius:10px; padding:10px; margin-right:16px; vertical-align:middle;">
                    <span style="font-size:22px;">🔒</span>
                  </div>
                  <div style="display:inline-block; vertical-align:middle;">
                    <p style="color:#ffffff; font-size:14px; font-weight:600; margin:0 0 4px 0;">Highly Secure & Confidential</p>
                    <p style="color:#a0a0c0; font-size:12px; margin:0;">Your case data is thoroughly protected</p>
                  </div>
                </div>

                <!-- Feature 4 -->
                <div style="background-color:#0f0f23; border-radius:12px; padding:16px 20px;">
                  <div style="display:inline-block; background-color:#1a1a3a; border-radius:10px; padding:10px; margin-right:16px; vertical-align:middle;">
                    <span style="font-size:22px;">📊</span>
                  </div>
                  <div style="display:inline-block; vertical-align:middle;">
                    <p style="color:#ffffff; font-size:14px; font-weight:600; margin:0 0 4px 0;">Real-time Status Track</p>
                    <p style="color:#a0a0c0; font-size:12px; margin:0;">Track updates of your ongoing processes</p>
                  </div>
                </div>

              </td>
            </tr>

            <!-- CTA Button -->
            <tr>
              <td align="center" style="padding: 24px 40px;">
                <a href="#" style="background-color:#00c2a8; color:#050b1d; text-decoration:none; font-size:15px; font-weight:700; padding:14px 40px; border-radius:10px; display:inline-block; letter-spacing:0.5px;">
                  Go to Dashboard 🚀
                </a>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding: 0 40px;">
                <div style="height:1px; background-color:#2a2a4a;"></div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding: 24px 40px 32px;">
                <p style="color:#555577; font-size:12px; margin:0 0 8px 0;">
                  Need help? Reach out to us
                </p>
                <a href="mailto:support@naiyebharat.com" style="color:#00c2a8; font-size:12px; text-decoration:none;">
                  support@naiyebharat.com
                </a>
                <p style="color:#555577; font-size:11px; margin:16px 0 0 0;">
                  © 2026 Naiye Bharat. Made with ❤️ in India
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `
}

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const orderDetailRow = (label, value) => `
  <tr>
    <td style="padding:10px 0; color:#8d8dab; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.7px;">${escapeHtml(label)}</td>
    <td align="right" style="padding:10px 0; color:#ffffff; font-size:13px; font-weight:700;">${escapeHtml(value || "-")}</td>
  </tr>
`;

// Client Order Confirm Template
export const sendClientOrderConfirmTemplate = (details) => {
  const {
    clientName,
    expertName,
    orderId,
    specialty,
    language,
    amount,
    paymentId,
  } = details;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0; padding:0; background-color:#0f0f1a; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a; padding:40px 20px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background-color:#1a1a2e; border-radius:18px; overflow:hidden; max-width:560px; width:100%; border:1px solid #2a2a4a;">
            <tr>
              <td align="center" style="padding:34px 40px 26px; border-bottom:1px solid #2a2a4a;">
                <div style="background-color:#00c2a8; width:54px; height:54px; border-radius:14px; display:inline-block; line-height:54px; text-align:center; font-size:26px; font-weight:800; color:#050b1d; margin-bottom:14px;">N</div>
                <br>
                <span style="color:#ffffff; font-size:23px; font-weight:800;">Naiye<span style="color:#00c2a8;">Bharat</span></span>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:38px 40px 18px;">
                <div style="font-size:42px; margin-bottom:14px;">&#10003;</div>
                <h1 style="color:#ffffff; font-size:24px; line-height:1.3; font-weight:800; margin:0 0 10px;">Your consultation is confirmed</h1>
                <p style="color:#a0a0c0; font-size:14px; line-height:1.7; margin:0;">
                  Thank you, <strong style="color:#00c2a8;">${escapeHtml(clientName || "Client")}</strong>. Your payment has been verified and your consultation request is now active.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f23; border:1px solid #2a2a4a; border-radius:14px; padding:18px 22px;">
                  ${orderDetailRow("Order ID", orderId)}
                  ${orderDetailRow("Assigned Expert", "Naiye Bharat Specialist")}
                  ${orderDetailRow("Specialty", specialty)}
                  ${orderDetailRow("Language", language)}
                  ${orderDetailRow("Amount Paid", `INR ${amount || 0}`)}
                  ${orderDetailRow("Payment ID", paymentId)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 26px;">
                <div style="background-color:#102a29; border-left:4px solid #00c2a8; border-radius:10px; padding:15px 18px;">
                  <p style="color:#b7fff4; font-size:13px; line-height:1.6; margin:0;">
                    Your expert has also been notified. You can open your client panel to track the consultation and continue the conversation.
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:4px 40px 34px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}" style="background-color:#00c2a8; color:#050b1d; text-decoration:none; font-size:14px; font-weight:800; padding:14px 34px; border-radius:10px; display:inline-block;">Open Client Panel</a>
                <p style="color:#555577; font-size:11px; margin:22px 0 0;">© 2026 Naiye Bharat. Secure consultation support.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

// Expert New Order Template
export const sendExpertNewOrderTemplate = (details) => {
  const {
    clientName,
    clientEmail,
    clientPhone,
    expertName,
    orderId,
    specialty,
    language,
    amount,
    issueDescription,
  } = details;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0; padding:0; background-color:#0f0f1a; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a; padding:40px 20px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background-color:#1a1a2e; border-radius:18px; overflow:hidden; max-width:560px; width:100%; border:1px solid #2a2a4a;">
            <tr>
              <td align="center" style="padding:34px 40px 26px; border-bottom:1px solid #2a2a4a;">
                <div style="background-color:#00c2a8; width:54px; height:54px; border-radius:14px; display:inline-block; line-height:54px; text-align:center; font-size:26px; font-weight:800; color:#050b1d; margin-bottom:14px;">N</div>
                <br>
                <span style="color:#ffffff; font-size:23px; font-weight:800;">Naiye<span style="color:#00c2a8;">Bharat</span></span>
              </td>
            </tr>
            <tr>
              <td style="padding:38px 40px 18px;">
                <p style="color:#00c2a8; font-size:12px; font-weight:800; letter-spacing:1px; text-transform:uppercase; margin:0 0 10px;">New paid consultation</p>
                <h1 style="color:#ffffff; font-size:24px; line-height:1.3; font-weight:800; margin:0 0 10px;">Hello ${escapeHtml(expertName || "Expert")}, a new order is assigned to you.</h1>
                <p style="color:#a0a0c0; font-size:14px; line-height:1.7; margin:0;">
                  The client has completed payment. Please review the details and respond from your advocate panel.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f23; border:1px solid #2a2a4a; border-radius:14px; padding:18px 22px;">
                  ${orderDetailRow("Order ID", orderId)}
                  ${orderDetailRow("Client", clientName)}
                  ${orderDetailRow("Client Email", clientEmail)}
                  ${orderDetailRow("Client Phone", clientPhone)}
                  ${orderDetailRow("Specialty", specialty)}
                  ${orderDetailRow("Language", language)}
                  ${orderDetailRow("Amount Paid", `INR ${amount || 0}`)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 24px;">
                <div style="background-color:#15152b; border:1px solid #2a2a4a; border-radius:14px; padding:18px;">
                  <p style="color:#8d8dab; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.7px; margin:0 0 8px;">Client Concern</p>
                  <p style="color:#ffffff; font-size:13px; line-height:1.7; margin:0;">${escapeHtml(issueDescription || "-")}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:4px 40px 34px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}" style="background-color:#00c2a8; color:#050b1d; text-decoration:none; font-size:14px; font-weight:800; padding:14px 34px; border-radius:10px; display:inline-block;">Open Advocate Panel</a>
                <p style="color:#555577; font-size:11px; margin:22px 0 0;">© 2026 Naiye Bharat. Paid consultation notification.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};
