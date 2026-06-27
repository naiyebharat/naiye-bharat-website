import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/utils/dbConnect';
import Advocate from '@/utils/models/advocate';
import { withAuth } from '@/utils/withAuth';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: NextRequest,
  { params }: { params: any }
) {
  const auth = await withAuth(request, "admin");
  if ("error" in auth) return auth.error;

  try {
    await connectDB();

    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: "Error: No Expert ID found." }, 
        { status: 400 }
      );
    }

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
      password 
    } = body;

    // Server-side validation
    const isSpecialtyEmpty = !specialty || (Array.isArray(specialty) && specialty.length === 0);
    if (!name || !experience || isSpecialtyEmpty || !pricing || !email || !phoneNumber) {
      return NextResponse.json(
        { error: "Validation Failed: Missing required fields." }, 
        { status: 400 }
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

    // Check if email conflicts with another advocate
    const conflictAdvocate = await Advocate.findOne({ 
      email: email.toLowerCase().trim(),
      _id: { $ne: id }
    });

    if (conflictAdvocate) {
      return NextResponse.json(
        { error: "Conflict: This email address is already in use by another advocate." },
        { status: 409 }
      );
    }

    // Retrieve the advocate document
    const advocate = await Advocate.findById(id);
    if (!advocate) {
      return NextResponse.json(
        { error: "Error: Advocate not found." },
        { status: 404 }
      );
    }

    // Update fields
    advocate.name = name;
    advocate.experience = parsedExperience;
    advocate.specialty = Array.isArray(specialty) ? specialty : [specialty].filter(Boolean);
    advocate.language = Array.isArray(language) ? language : [language];
    advocate.pricing = parsedPricing;
    advocate.videoUrl = videoUrl || '';
    advocate.email = email.toLowerCase().trim();
    advocate.phoneNumber = phoneNumber.trim();

    // Only update and hash password if a new one is provided
    if (password && password.trim() !== '') {
      advocate.password = password; // Pre-save hook hashes it automatically
    }

    await advocate.save();

    // Security trim password
    const secureData = advocate.toObject();
    delete secureData.password;

    return NextResponse.json({
      success: true,
      message: "Advocate profile updated successfully! ✨",
      data: secureData
    }, { status: 200 });

  } catch (error: any) {
    console.error("Admin Edit API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error: Record is not updated." }, 
      { status: 500 }
    );
  }
}
