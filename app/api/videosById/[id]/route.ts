
import { connectDB } from "@/lib/mongodb";
import Video from "@/models/video.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest,{ params }: { params: { id: string } }) {
  try {
    await connectDB();

 const {id} = await params; // Get videoId from the route

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch videos by userId
    const video = await Video.findById(id).lean();

    if (video.length === 0) {
      return NextResponse.json(
        { success: false, message: "No videos found for this user" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Video found", data: video },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
