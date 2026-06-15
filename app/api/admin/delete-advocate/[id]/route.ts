import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/utils/dbConnect';
import Advocate from '@/utils/models/advocate';
import { withAuth } from '@/utils/withAuth';

/**
 * 1. DELETE: Advocate Profile Deletion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: any }
) {
  const auth = await withAuth(request, "admin");
  if ("error" in auth) return auth.error;
  try {
    await connectDB();

    // 🚀 FIX: params ko await karna zaroori hai Next.js 15+ mein
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Debugging ke liye server terminal mein print karega
    console.log("Wiping out Expert with ID:", id);

    // Agar Frontend se id missing ho ya 'undefined' string aaye
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: "Error: No Expert ID found." }, 
        { status: 400 }
      );
    }

    // Database deletion logic
    const deletedAdvocate = await Advocate.findByIdAndDelete(id);

    if (!deletedAdvocate) {
      return NextResponse.json(
        { error: "Error: No expert found." }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Expert profile successfully wiped out by admin! 🗑️" 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Admin Delete API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error: Record is not deleted." }, 
      { status: 500 }
    );
  }
}

/**
 * 2. PATCH: Dynamic Advocate Availability Toggle 🔄
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: any }
) {
  // Security Layer: Check if authenticated user is admin
  const auth = await withAuth(request, "admin");
  if ("error" in auth) return auth.error;

  try {
    await connectDB();

    // Next.js 15+ params wrapper resolution
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Request body se target active/inactive true or false status read karenge
    const body = await request.json();
    const { isAvailable } = body;

    // Validations Matrix
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: "Error: Missing Advocate ID in route dynamic parameters." },
        { status: 400 }
      );
    }

    if (typeof isAvailable !== "boolean") {
      return NextResponse.json(
        { error: "Error: isAvailable status boolean (true/false) hona mandatory hai." },
        { status: 400 }
      );
    }

    // Direct atomic overwrite updating availability status bypassing encryption pre-hooks
    const updatedAdvocate = await Advocate.findByIdAndUpdate(
      id,
      { isAvailable: isAvailable },
      { new: true, runValidators: true }
    );

    if (!updatedAdvocate) {
      return NextResponse.json(
        { error: "Error: Target advocate record not found in database." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${updatedAdvocate.name} availability updated successfully! ✨`,
      data: updatedAdvocate
    }, { status: 200 });

  } catch (error: any) {
    console.error("Admin Availability Toggle PATCH API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error: Dynamic toggle sync failed." },
      { status: 500 }
    );
  }
}