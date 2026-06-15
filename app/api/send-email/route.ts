import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name: string; email: string; phone: string; caseType: string; occupation: string; address: string; timeSlot: string; message: string; payment_id: string; order_id?: string };
    const { name, email, phone, caseType, occupation, address, timeSlot, message, payment_id, order_id } = body;

    // Validate required fields
    if (!name || !email || !phone || !caseType || !occupation || !address || !timeSlot || !message || !payment_id) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      // Bypass if email config is missing locally
      console.warn("Emails bypassed because EMAIL_USER or EMAIL_PASS not configured.", body);
      return NextResponse.json({
        success: true,
        message: 'Email bypassed (credentials missing)',
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email to Admin
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Consultation Request - ${caseType} | ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
          <h2>New Consultation Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Case Type:</strong> ${caseType}</p>
          <p><strong>Occupation:</strong> ${occupation}</p>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>Time Slot:</strong> ${timeSlot}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr/>
          <p><strong>Payment ID:</strong> ${payment_id}</p>
          <p><strong>Order ID:</strong> ${order_id}</p>
        </div>
      `,
    };

    // Send emails
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Email notifications sent successfully',
    });
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'Failed to send email', error: errorMessage },
      { status: 500 }
    );
  }
}
