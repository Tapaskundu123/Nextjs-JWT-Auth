// app/AllVideos/page.tsx
"use client";

import React, { useEffect } from "react";
import useSWR from "swr";
import axios from "axios";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import Image from "next/image";

// Fetcher for SWR
const fetcher = (url: string) =>
  axios.get(url, { withCredentials: true }).then((res) => res.data);

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  userId: string;
}

export default function AllVideosPage() {
  const { data, error, isLoading } = useSWR("/api/videos", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const videos: Video[] = data?.data || [];

  useEffect(() => {
    if (error) {
      toast.error("Failed to load videos");
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading videos...</div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">Failed to load videos</p>
          <Link
            href="/upload"
            className="text-blue-600 hover:underline font-medium"
          >
            ← Go back to upload
          </Link>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-600 mb-6">No videos uploaded yet</p>
          <Link
            href="/upload"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-8 py-4 rounded-full hover:shadow-xl transition"
          >
            Upload Your First Video
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            All Videos
          </h1>
          <p className="text-lg text-gray-600">
            {videos.length} video{videos.length !== 1 ? "s" : ""} uploaded
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {videos.map((video) => (
            <div
              key={video._id}
              className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Video Thumbnail with Play on Hover */}
              <div className="relative aspect-video overflow-hidden bg-black">
                <Image
                  height={100}
                  width={400}
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg
                      className="w-20 h-20 text-white drop-shadow-lg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* Duration badge (optional – you can add later) */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                  NEW
                </div>
              </div>

              {/* Video Info */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-800 line-clamp-2 mb-2">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {video.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(video.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <Link
                    href={`/video/${video._id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium transition"
                  >
                    Watch →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back to Upload */}
        <div className="text-center mt-16">
          <Link
            href="/upload"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-10 py-5 rounded-full hover:shadow-2xl transition text-lg"
          >
            Upload New Video
          </Link>
        </div>
     ,`
      </div>
    </div>
  );
}