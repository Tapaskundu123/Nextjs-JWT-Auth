import { IVideo, Video } from "@/models/video.model";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

     const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const allVideos = await Video.find({}).sort({ createdAt: -1 }).lean();

    if (!allVideos || allVideos.length === 0) {
      return NextResponse.json({ success: false, message: "Videos not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: allVideos });
  } catch (error: any) {
    console.error("GET error:", error.message);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Optional: verify token to ensure it’s valid
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    await connectDB();

    const videoBody: IVideo = await req.json();

    const { title, description, videoUrl, thumbnailUrl, transformation } = videoBody;

    if (!title || !description || !videoUrl || !thumbnailUrl || !transformation) {
      return NextResponse.json({ success: false, message: "Incomplete video details" }, { status: 400 });
    }

    // ✅ You forgot to await here
    const newVideoDB = await Video.create({
      ...videoBody,
      userId: decoded.id, // if you store user info in token
    });

    return NextResponse.json(
      { success: true, message: "Video uploaded successfully", data: newVideoDB },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST error:", error.message);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
