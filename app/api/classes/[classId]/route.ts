import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import DrivingClass from "@/lib/models/Class";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    await dbConnect();
    
    const { classId } = await params;
    
    // Validate classId format
    if (!classId || classId === 'undefined' || classId === 'null') {
      console.error("Invalid classId provided:", classId);
      return NextResponse.json(
        { success: false, message: "Invalid class ID provided" },
        { status: 400 }
      );
    }

    // Check if classId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      console.error("Invalid ObjectId format:", classId);
      return NextResponse.json(
        { success: false, message: "Invalid class ID format" },
        { status: 400 }
      );
    }

    console.log("Searching for driving class with ID:", classId);
    console.log("ClassId type:", typeof classId);
    
    // Try multiple search methods
    let drivingClass = await DrivingClass.findById(classId);
    
    // If not found, try with ObjectId conversion
    if (!drivingClass) {
      try {
        const objectId = new mongoose.Types.ObjectId(classId);
        drivingClass = await DrivingClass.findById(objectId);
        console.log("Tried with ObjectId conversion, result:", drivingClass ? "found" : "not found");
      } catch (objIdError) {
        console.error("Error converting to ObjectId:", objIdError);
      }
    }
    
    // If still not found, try with findOne
    if (!drivingClass) {
      try {
        const objectId = new mongoose.Types.ObjectId(classId);
        drivingClass = await DrivingClass.findOne({ _id: objectId });
        console.log("Tried with findOne, result:", drivingClass ? "found" : "not found");
      } catch (objIdError) {
        console.error("Error with findOne:", objIdError);
      }
    }
    
    if (!drivingClass) {
      console.error("Driving class not found for ID:", classId);
      // Try to find if there are any classes at all
      const totalClasses = await DrivingClass.countDocuments();
      console.log("Total classes in database:", totalClasses);
      
      // Get a sample of class IDs to help debug
      const sampleClasses = await DrivingClass.find({}).select('_id title').limit(5).lean();
      console.log("Sample class IDs:", sampleClasses.map(c => ({ id: c._id?.toString(), title: c.title })));
      
      return NextResponse.json(
        { 
          success: false, 
          message: "Driving class not found", 
          classId, 
          totalClasses,
          sampleClasses: sampleClasses.map(c => ({ id: c._id?.toString(), title: c.title }))
        },
        { status: 404 }
      );
    }

    console.log("Found driving class:", drivingClass.title);
    return NextResponse.json({
      success: true,
      data: drivingClass
    });
  } catch (error) {
    console.error("Error fetching driving class:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    await dbConnect();

    const { classId } = await params;
    const body = await request.json();


    // Validate classId
    if (!classId || classId === 'undefined') {
      console.error("❌ [PUT_CLASS] Invalid classId:", classId);
      return NextResponse.json(
        { success: false, message: "Invalid class ID provided" },
        { status: 400 }
      );
    }

    // Validate required fields from body
    const requiredFields = ['title', 'length', 'price', 'overview', 'buttonLabel'];
    for (const field of requiredFields) {
      if (!body[field] && body[field] !== 0) {
        console.error(`❌ [PUT_CLASS] Missing required field: ${field}`);
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if class exists first
    const existingClass = await DrivingClass.findById(classId);
    if (!existingClass) {
      console.error("❌ [PUT_CLASS] Class not found:", classId);
      return NextResponse.json(
        { success: false, message: "Driving class not found" },
        { status: 404 }
      );
    }


    // Remove _id from body if it exists to avoid conflicts
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...updateData } = body;

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();


    // Asegurar que classType se preserve exactamente como viene
    if (updateData.classType) {

    }

    let updatedClass;
    try {

      updatedClass = await DrivingClass.findByIdAndUpdate(
        classId,
        updateData,
        {
          new: true,
          runValidators: true,
          upsert: false // Don't create if not exists
        }
      );

    } catch (dbError) {
      console.error("❌ [PUT_CLASS] Database update failed:", dbError);
      throw dbError; // Re-throw to be caught by outer catch
    }

    if (!updatedClass) {
      console.error("❌ [PUT_CLASS] Failed to update class");
      return NextResponse.json(
        { success: false, message: "Failed to update driving class" },
        { status: 500 }
      );
    }


    return NextResponse.json({
      success: true,
      data: updatedClass,
      message: "Class updated successfully"
    });
  } catch (error) {
    console.error("❌ [PUT_CLASS] Error updating driving class:", error);

    // Provide more specific error messages
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: "Validation error", errors: validationErrors },
        { status: 400 }
      );
    }

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { success: false, message: "Invalid class ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    await dbConnect();

    const { classId } = await params;


    // Validate classId
    if (!classId || classId === 'undefined') {
      console.error("❌ [DELETE_CLASS] Invalid classId:", classId);
      return NextResponse.json(
        { success: false, message: "Invalid class ID provided" },
        { status: 400 }
      );
    }

    // Check if class exists first
    const existingClass = await DrivingClass.findById(classId);
    if (!existingClass) {
      console.error("❌ [DELETE_CLASS] Class not found:", classId);
      return NextResponse.json(
        { success: false, message: "Driving class not found" },
        { status: 404 }
      );
    }


    // Delete the class
    await DrivingClass.findByIdAndDelete(classId);


    return NextResponse.json({
      success: true,
      message: "Class deleted successfully"
    });
  } catch (error) {
    console.error("❌ [DELETE_CLASS] Error deleting driving class:", error);

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { success: false, message: "Invalid class ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}