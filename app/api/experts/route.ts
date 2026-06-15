// @ts-nocheck

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import Advocate from "@/utils/models/advocate";
import ClientOrder from "@/utils/models/Order";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findMatchedAdvocates(specialty: string, language: string) {
  const safeSpecialty = escapeRegex(specialty.trim());
  const safeLanguage = escapeRegex(language.trim());

  // STAGE 1: Exact Specialty AND Exact Language (Sirf wahi jo Available hain aur jinka role 'advocate' hai)
  let queryFilter: any = {
    isAvailable: true,
    role: "advocate", // 🔥 FIX: Admin profiles ko strict filter out karne ke liye role validation loop check lagaya
    specialty: { $regex: new RegExp(`^${safeSpecialty}$`, "i") },
    language: { $regex: new RegExp(`^${safeLanguage}$`, "i") },
  };

  let matchedAdvocates = await Advocate.find(queryFilter);

  // STAGE 2: Agar nahi mile, toh Broad Specialty keyword + Language match karo
  if (matchedAdvocates.length === 0) {
    const specialtyKeyword = specialty.split("/")[0].trim();

    queryFilter = {
      isAvailable: true,
      role: "advocate", // 🔥 FIX: Yahan bhi secure structural safety check enabled
      specialty: { $regex: new RegExp(escapeRegex(specialtyKeyword), "i") },
      language: { $regex: new RegExp(`^${safeLanguage}$`, "i") },
    };
    matchedAdvocates = await Advocate.find(queryFilter);
  }

  // STAGE 3: Agar fir bhi nahi mile, toh kam se kam Language match karne wale available advocates le aao
  if (matchedAdvocates.length === 0) {
    queryFilter = {
      isAvailable: true,
      role: "advocate", // 🔥 FIX: Fallback pipeline layer me bhi security intact hai
      language: { $regex: new RegExp(`^${safeLanguage}$`, "i") },
    };
    matchedAdvocates = await Advocate.find(queryFilter);
  }

  return matchedAdvocates;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    let specialty = searchParams.get("specialty");
    let language = searchParams.get("language");

    // Agar Order ID aayi hai toh order document se details nikalenge
    if (orderId) {
      const currentOrder = await ClientOrder.findById(orderId);
      if (!currentOrder) {
        return NextResponse.json(
          { success: false, error: "Active intake order packet not found." },
          { status: 404 },
        );
      }

      specialty = currentOrder.specialty;
      language = currentOrder.language;
    }

    // Validation checks
    if (!specialty || !language) {
      return NextResponse.json(
        { success: false, error: "Match criteria missing." },
        { status: 400 },
      );
    }

    // Pipeline Execute karenge
    const matchedAdvocates = await findMatchedAdvocates(specialty, language);

    return NextResponse.json(
      {
        success: true,
        count: matchedAdvocates.length,
        data: matchedAdvocates,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Advocate Matcher API Crash:", error);
    return NextResponse.json(
      { success: false, error: "Internal lookup pipeline error." },
      { status: 500 },
    );
  }
}