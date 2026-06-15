// Temporary in-memory store for Orders and Payments to bypass MongoDB
// In production, this data should be written to and read from a database.

export interface Order {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: 'created' | 'paid' | 'failed';
  payment_id?: string;
  paidAt?: Date;
  createdAt: Date;
}

export interface Payment {
  order_id: string;
  payment_id: string;
  signature: string;
  status: 'verified' | 'failed';
  verifiedAt: Date;
}

declare global {
  var _mockedOrders: Map<string, Order> | undefined;
  var _mockedPayments: Map<string, Payment> | undefined;
}

const mockedOrders = global._mockedOrders || new Map<string, Order>();
const mockedPayments = global._mockedPayments || new Map<string, Payment>();

if (process.env.NODE_ENV !== 'production') {
  global._mockedOrders = mockedOrders;
  global._mockedPayments = mockedPayments;
}

export { mockedOrders, mockedPayments };

