import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { mockedOrders } from '@/utils/store';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { amount: number; currency?: string; receipt?: string; notes?: Record<string, string | number> };
    const { amount, currency = 'INR', receipt, notes } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Razorpay keys not configured' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create order options
    const options = {
      amount: amount * 100, // Amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    // Create order
    const order = await razorpay.orders.create(options);

    // Store order details
    mockedOrders.set(order.id, {
      id: order.id,
      amount: order.amount as number,
      currency: order.currency,
      receipt: order.receipt || undefined,
      status: 'created',
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: unknown) {
    console.error('Error creating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'Failed to create order', error: errorMessage },
      { status: 500 }
    );
  }
}
