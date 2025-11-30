import { NextRequest, NextResponse } from "next/server";
import Admin from "@/lib/models/Admin";
import { connectToDB } from "@/lib/mongoDB";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    const { adminId } = await params;
    await connectToDB();

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: (admin._id as any).toString(),
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      phoneNumber: admin.phoneNumber,
      role: admin.role,
      permissions: admin.permissions || [],
    });
  } catch (error) {
    console.error("Error fetching admin:", error);
    return NextResponse.json(
      { error: "Error fetching admin" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    const { adminId } = await params;
    await connectToDB();

    const data = await req.json();

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    // Update permissions
    if (data.permissions !== undefined) {
      admin.permissions = data.permissions;
    }

    // Update basic info
    if (data.firstName !== undefined) {
      admin.firstName = data.firstName;
    }
    if (data.lastName !== undefined) {
      admin.lastName = data.lastName;
    }
    if (data.email !== undefined) {
      admin.email = data.email;
      admin.username = data.email; // Keep username in sync with email
    }
    if (data.phoneNumber !== undefined) {
      admin.phoneNumber = data.phoneNumber;
    }

    await admin.save();

    return NextResponse.json({
      message: "Admin updated successfully",
      admin: {
        id: (admin._id as any).toString(),
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        phoneNumber: admin.phoneNumber,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    return NextResponse.json(
      { error: "Error updating admin" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    const { adminId } = await params;
    await connectToDB();

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    await Admin.findByIdAndDelete(adminId);

    return NextResponse.json({
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { error: "Error deleting admin" },
      { status: 500 }
    );
  }
}
