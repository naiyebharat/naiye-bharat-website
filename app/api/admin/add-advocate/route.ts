import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/utils/dbConnect'; 
import Advocate from '@/utils/models/advocate';
import { withAuth } from '@/utils/withAuth'; 

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, "admin");
  if ("error" in auth) return auth.error;
  try {
    // 1. Database Connection initialize karein
    await connectDB();

    // 2. Parse payload incoming parameters
    const body = await request.json();
    const { 
      name, 
      experience, 
      specialty, 
      language, 
      pricing, 
      videoUrl, 
      email, 
      phoneNumber, 
      qualification, 
      avatar,
      password 
    } = body;

    // 3. Strict Server-Side Validation (Naye parameters ke sath)
    const isSpecialtyEmpty = !specialty || (Array.isArray(specialty) && specialty.length === 0);
    if (!name || !experience || isSpecialtyEmpty || !pricing || !email || !phoneNumber || !password) {
      return NextResponse.json(
        { error: "Validation Failed: Missing required credentials (Name, Experience, Password, Email, Phone, Domain, Fee)." }, 
        { status: 400 }
      );
    }

    // 4. Checking if email already exists matrix
    const existingAdvocate = await Advocate.findOne({ email: email.toLowerCase().trim() });
    if (existingAdvocate) {
      return NextResponse.json(
        { error: "Conflict: A lawyer with this email address is already registered." },
        { status: 409 }
      );
    }

    const parsedExperience = Number(experience);
    const parsedPricing = Number(pricing);

    if (isNaN(parsedExperience) || isNaN(parsedPricing)) {
      return NextResponse.json(
        { error: "Validation Failed: Experience and Pricing must be valid numbers." }, 
        { status: 400 }
      );
    }

    // 5. Create document entry inside MongoDB Atlas
    // (Note: Password pre-save hook se auto encrypt ho jayega, aur role dynamic text standard se handle hoga)
    const newAdvocate = await Advocate.create({
      name,
      experience: parsedExperience,
      specialty: Array.isArray(specialty) ? specialty : [specialty].filter(Boolean),
      language: Array.isArray(language) ? language : [language],
      pricing: parsedPricing,
      videoUrl: videoUrl || '',
      qualification: qualification || 'Verified Practitioner',
      avatar: avatar || '',
      email: email.toLowerCase().trim(), 
      phoneNumber: phoneNumber.trim(),    
      password: password, // Mongoose schema automatically isko hash kar dega save se pehle
      isAvailable: true 
    });

    // 6. Security Trim: Send response without password node for network transparency
    const secureDataResponse = newAdvocate.toObject();
    delete secureDataResponse.password;

    // 7. Success Response
    return NextResponse.json({ 
      success: true, 
      message: "Advocate credentials successfully configured and registered inside security node! 🎉", 
      data: secureDataResponse 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Database Transaction Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Production Server Error. Data synchronization failed." }, 
      { status: 500 }
    );
  }
}

// This api is returning all the experts from database
export async function GET(req: NextRequest) {
  const auth = await withAuth(req, "admin");
  if ("error" in auth) return auth.error;
  try {
    // Database connection check
    await connectDB();

    // 🔍 Filter lagaya hai taaki jiska role 'admin' ho wo neglect ho jaye
    // Latest experts ko sabse upar dikhane ke liye sort({ createdAt: -1 }) lagaya hai
    const advocates = await Advocate.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 });
    
    return NextResponse.json(advocates, { status: 200 });
  } catch (error: any) {
    console.error("GET API Error:", error);
    return NextResponse.json(
      { error: "Error in getting advocates from database." }, 
      { status: 500 }
    );
  }
}