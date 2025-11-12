"use client";

import React, { useRef, useState } from "react";
import axios from "axios";
import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/next";

// ---------- Props Interface ----------
interface FileUploadProps {
  onSuccess?: (res: any) => void;
  onProgress?: (progress: number) => void;
  filetype?: "image" | "video";
}

// ---------- Component ----------
const UploadExample = ({
  onSuccess = () => {},
  onProgress,
  filetype = "video",
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortController = new AbortController();

  // ---------- Validator Function ----------
  const validateFile = (file: File) => {
    if (!file) return { valid: false, message: "Please select a file." };

    if (filetype === "video") {
      if (!file.type.startsWith("video/"))
        return { valid: false, message: "Only video files are allowed." };
      if (file.size > 100 * 1024 * 1024)
        return { valid: false, message: "Video size must be under 100MB." };
    }

    if (filetype === "image") {
      if (!file.type.startsWith("image/"))
        return { valid: false, message: "Only image files are allowed." };
      if (file.size > 10 * 1024 * 1024)
        return { valid: false, message: "Image size must be under 10MB." };
    }

    return { valid: true, message: "Validation successful." };
  };

  // ---------- File Upload Handler ----------
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 🔐 Get ImageKit auth parameters from backend
      const { data: authRes } = await axios.get("/api/auth/imagekit-auth");

      // 🆙 Upload file to ImageKit
      const uploadResponse = await upload({
        file, // File object
        fileName: file.name,
        signature: authRes.signature,
        token: authRes.token,
        expire: authRes.expire,
        publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
        folder: filetype === "video" ? "/videos" : "/images",
        onProgress: (event) => {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
          onProgress?.(percent);
        },
        abortSignal: abortController.signal,
      });

      console.log("✅ Upload successful:", uploadResponse);
      onSuccess(uploadResponse);
    } catch (err: any) {
      if (err instanceof ImageKitAbortError) setError("Upload aborted.");
      else if (err instanceof ImageKitInvalidRequestError)
        setError("Invalid upload request.");
      else if (err instanceof ImageKitServerError)
        setError("Server error. Try again later.");
      else if (err instanceof ImageKitUploadNetworkError)
        setError("Network error during upload.");
      else setError("Something went wrong.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  // ---------- JSX ----------
  return (
    <div className="space-y-3">
      <input
        type="file"
        accept={filetype === "video" ? "video/*" : "image/*"}
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={uploading}
        className="block"
      />

      {uploading && (
        <div>
          <p>Uploading...</p>
          <progress value={progress} max={100} />
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default UploadExample;
