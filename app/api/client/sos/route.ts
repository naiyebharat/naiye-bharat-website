import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import SOSRequest from "@/utils/models/SOSRequest";
import Advocate from "@/utils/models/advocate";
import { withAuth } from "@/utils/withAuth";

function getSpecialistName(id: string) {
  if (!id) return "Naiye Bharat Specialist";
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % 10) + 1;
  return `Naiye Bharat Specialist ${index}`;
}

export async function GET(req: NextRequest) {
  const auth = await withAuth(req, "client");
  if ("error" in auth) return auth.error;

  const clientId = auth.payload.id;

  try {
    await connectDB();

    const sosRequests = await SOSRequest.find({ clientId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean() as any[];

    const data = [];

    for (const sos of sosRequests) {
      let lawyer = null;
      if (sos.lawyerId) {
        const advocate = await Advocate.findById(sos.lawyerId)
          .select("name phoneNumber specialty experience avatar currentLocation")
          .lean() as any;

        if (advocate) {
          lawyer = {
            id: advocate._id.toString(),
            name: getSpecialistName(advocate._id.toString()),
            phoneNumber: undefined, // Hide phone number from client
            specialty: advocate.specialty,
            experience: advocate.experience,
            avatar: "", // Hide avatar
            currentLocation: advocate.currentLocation || null,
          };
        }
      }

      data.push({
        id: sos._id.toString(),
        emergencyType: sos.emergencyType || "Emergency Legal Assistance",
        status: sos.status || "pending",
        amountPaid: sos.amountPaid || 4500,
        payout: sos.payout || 3600,
        eta: sos.eta || "",
        paymentReleased: !!sos.paymentReleased,
        paymentId: sos.paymentId || "",
        clientLocation: sos.clientLocation || null,
        lawyer,
        createdAt: sos.createdAt,
        updatedAt: sos.updatedAt,
      });
    }

    return NextResponse.json({ success: true, sosRequests: data });
  } catch (error: any) {
    console.error("Client SOS Fetch Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch SOS requests", error: error.message },
      { status: 500 }
    );
  }
}
