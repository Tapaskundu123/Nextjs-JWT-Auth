// app/video/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Play, ArrowLeft } from "lucide-react";

// Helper: Clean + serialize video data so it's safe for SSR
function serializeVideo(video: any) {
  if (!video) return null;

  return {
    _id: video._id?.toString() || video.id?.toString(),
    title: video.title || "Untitled Video",
    description: video.description || "No description",
    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl,
    createdAt: video.createdAt
      ? new Date(video.createdAt).toISOString()
      : new Date().toISOString(),
  };
}

// Fetch video safely
async function getVideoById(id: string) {
  // Use your internal route (recommended for server components)
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/videosById/${id}`, {
    method: "GET",
    cache: "no-store", // always fresh
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) return null;

  const json = await res.json();
  if (!json.success || !json.data) return null;

  return serializeVideo(json.data); // ← Critical: make it serializable
}

export default async function VideoPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await getVideoById(id);

  if (!video) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <Link
          href="/AllVideos"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to All Videos
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* Video Player */}
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl mb-8">
          <video
            src={video.videoUrl}
            controls
            poster={video.thumbnailUrl}
            className="w-full h-full object-contain"
            controlsList="nodownload"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-8 opacity-0 hover:opacity-100 transition-opacity">
              <Play className="w-16 h-16 text-white fill-white" />
            </div>
          </div>
        </div>

        {/* Video Details */}
        <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 shadow-xl border border-gray-700">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            {video.title}
          </h1>

          <div className="text-gray-400 text-sm mb-6">
            Uploaded on{" "}
            <time className="font-medium text-gray-300">
              {format(new Date(video.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </time>
          </div>

          <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap">
            {video.description}
          </p>
        </div>

        {/* Upload CTA */}
        <div className="text-center mt-16">
          <Link
            href="/videoUpload"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg px-10 py-5 rounded-full shadow-2xl hover:scale-105 transition"
          >
            <Play className="w-6 h-6" />
            Upload Your Video
          </Link>
        </div>
      </div>
    </div>
  );
}