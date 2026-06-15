import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/utils/dbConnect"; 
import Order from "@/utils/models/Order";
import { withAuth } from "@/utils/withAuth";

export const dynamic = "force-dynamic"; // Taaki live metrics calculate ho, cache na ho

export async function GET(req: NextRequest) {
  const auth = await withAuth(req, "admin");
  if ("error" in auth) return auth.error;
  try {
    await connectDB();

    // 🚀 MongoDB Facet Pipeline for high-speed calculation
    const pipelineData = await Order.aggregate([
      {
        $facet: {
          paidMetrics: [
            { $match: { status: "paid" } }, // Sirf paid orders ko filter karo
            {
              $group: {
                _id: null,
                totalPaidOrders: { $sum: 1 },
                totalRevenue: { $sum: "$amount" }, // Razorpay standard final amount field
              },
            },
          ],
          overallMetrics: [
            {
              $group: {
                _id: null,
                totalCreatedOrders: { $sum: 1 }, // System mein bane total orders (pending + paid etc.)
              },
            },
          ],
        },
      },
    ]);

    // Data Extraction layers safely
    const paidStats = pipelineData[0]?.paidMetrics[0] || { totalPaidOrders: 0, totalRevenue: 0 };
    const overallStats = pipelineData[0]?.overallMetrics[0] || { totalCreatedOrders: 0 };

    const totalPaidOrders = paidStats.totalPaidOrders;
    const totalRevenue = paidStats.totalRevenue;
    const totalCreatedOrders = overallStats.totalCreatedOrders;

    // 🔥 Calculate Conversion Rate Safely
    const conversionRate =
      totalCreatedOrders > 0
        ? ((totalPaidOrders / totalCreatedOrders) * 100).toFixed(1)
        : "0.0";

    return NextResponse.json({
      success: true,
      data: {
        totalPaidOrders,
        totalRevenue,
        conversionRate,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}