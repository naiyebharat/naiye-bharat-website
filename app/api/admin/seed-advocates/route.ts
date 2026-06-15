import { NextResponse } from "next/server";
import { connectDB } from "@/utils/dbConnect";
import Advocate from "@/utils/models/advocate";

const SEED_ADVOCATES = [
  {
    name: "Adv. Aryan Jha",
    age: 34,
    specialty: "Legal Support / Consultation",
    language: ["Hindi", "English"],
    pricing: 699,
    videoUrl: "",
    isAvailable: true,
    qualification: "Criminal & Family Litigation Specialist",
    practiceYears: 8,
    avatar: "",
    email: "aryan.jha@naiyebharat.com",
    phoneNumber: "9876543210"
  },
  {
    name: "Dr. Shalini Mukherji",
    age: 41,
    specialty: "Mental Health / Therapy",
    language: ["English", "Hindi", "Punjabi"],
    pricing: 999,
    videoUrl: "",
    isAvailable: true,
    qualification: "Clinical Psychologist & Trauma Counsellor",
    practiceYears: 12,
    avatar: "",
    email: "shalini.m@naiyebharat.com",
    phoneNumber: "9876543211"
  },
  {
    name: "Adv. Karanvir Singh",
    age: 38,
    specialty: "Corporate Law Node",
    language: ["English", "Punjabi"],
    pricing: 1499,
    videoUrl: "",
    isAvailable: true,
    qualification: "Mergers & Intellectual Property Strategist",
    practiceYears: 10,
    avatar: "",
    email: "karanvir.s@naiyebharat.com",
    phoneNumber: "9876543212"
  },
  {
    name: "Adv. Anjali Nair",
    age: 32,
    specialty: "Legal Support / Consultation",
    language: ["English", "Malayalam"],
    pricing: 899,
    videoUrl: "",
    isAvailable: true,
    qualification: "Constitutional & Civil Law Specialist",
    practiceYears: 6,
    avatar: "",
    email: "anjali.n@naiyebharat.com",
    phoneNumber: "9876543213"
  },
  {
    name: "Dr. Rohan Varma",
    age: 30,
    specialty: "Mental Health / Therapy",
    language: ["Hindi", "English"],
    pricing: 599,
    videoUrl: "",
    isAvailable: true,
    qualification: "Cognitive Behavioral & Stress Management Coach",
    practiceYears: 5,
    avatar: "",
    email: "rohan.v@naiyebharat.com",
    phoneNumber: "9876543214"
  },
  {
    name: "Adv. Devika Menon",
    age: 36,
    specialty: "Corporate Law Node",
    language: ["English", "Malayalam", "Hindi"],
    pricing: 1299,
    videoUrl: "",
    isAvailable: true,
    qualification: "Corporate Compliance & Tax Counsel",
    practiceYears: 9,
    avatar: "",
    email: "devika.m@naiyebharat.com",
    phoneNumber: "9876543215"
  }
];

export async function GET() {
  try {
    await connectDB();

    // Pehle existing advocates clear karenge to avoid duplicate emails
    const emails = SEED_ADVOCATES.map(adv => adv.email);
    await Advocate.deleteMany({ email: { $in: emails } });

    // Seed advocates insert karenge
    const createdAdvocates = await Advocate.insertMany(SEED_ADVOCATES);

    return NextResponse.json({
      success: true,
      message: `${createdAdvocates.length} premium high-fidelity advocates successfully seeded! 🚀`,
      data: createdAdvocates
    }, { status: 201 });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to seed database."
    }, { status: 500 });
  }
}
