import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { mockedOrders, mockedPayments, Order, Payment } from '@/utils/store';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Missing required payment details' },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Razorpay secret not configured' },
        { status: 500 }
      );
    }

    // Create signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    // Verify signature
    if (razorpay_signature === expectedSign) {
      // Update order status
      const order = mockedOrders.get(razorpay_order_id);
      if (order) {
        const updatedOrder: Order = {
          ...order,
          status: 'paid',
          payment_id: razorpay_payment_id,
          paidAt: new Date(),
        };
        mockedOrders.set(razorpay_order_id, updatedOrder);
      }

      // Store payment details
      const payment: Payment = {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        status: 'verified',
        verifiedAt: new Date(),
      };
      mockedPayments.set(razorpay_payment_id, payment);

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid payment signature' },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    console.error('Error verifying payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'Payment verification failed', error: errorMessage },
      { status: 500 }
    );
  }
}
