import React, { useState, useEffect, useRef, useCallback } from "react";
import { YoutubeFilled } from "@church-space/ui/icons";
import { VideoBlockData } from "@/types/blocks";
import Image from "next/image";
import { cn } from "@church-space/ui/cn";

interface VideoBlockProps {
  data?: VideoBlockData;
  isRounded?: boolean;
}

export default function VideoBlock({ data, isRounded }: VideoBlockProps) {
  const [result, setResult] = useState({
    success: false,
    message: "",
    videoId: "",
  });

  const prevUrlRef = useRef<string | undefined>(undefined);

  // Memoize the extractYouTubeId function to prevent unnecessary recreations
  const extractYouTubeId = useCallback((url: string): string | undefined => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return undefined;
  }, []);

  useEffect(() => {
    // Skip if URL hasn't changed or is undefined
    if (!data?.url || data.url === prevUrlRef.current) return;

    // Update the ref with current URL
    prevUrlRef.current = data.url;

    const id = extractYouTubeId(data.url);
    if (id) {
      setResult({
        success: true,
        message: `Extracted YouTube ID: ${id}`,
        videoId: id,
      });
    } else {
      setResult({
        success: false,
        message: "Invalid YouTube URL",
        videoId: "",
      });
    }
  }, [data?.url, extractYouTubeId]);

  const imageUrl = `https://i3.ytimg.com/vi/${result.videoId}/maxresdefault.jpg`;
  const style = {
    maxWidth: data?.size ? `${data.size}%` : "33%",
    margin: data?.centered ? "0 auto" : undefined,
  };

  return (
    <div className="relative" style={style}>
      {result.success ? (
        <div
          className={cn(
            "bg-background aspect-video ",
            isRounded && "rounded-md"
          )}
        >
          <Image
            src={imageUrl}
            alt="Video Thumbnail"
            className={cn(
              "w-full h-full object-cover ",
              isRounded && "rounded-md"
            )}
            width={1920}
            height={1080}
          />
        </div>
      ) : (
        <div
          className={cn(
            "bg-background aspect-video ",
            isRounded && "rounded-md"
          )}
        ></div>
      )}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <YoutubeFilled
          height={String(
            data?.size ? Math.max(40, Math.min(80, (80 * data.size) / 100)) : 80
          )}
          width={String(
            data?.size ? Math.max(40, Math.min(80, (80 * data.size) / 100)) : 80
          )}
          fill="#FF0000"
          secondaryfill="#FFFFFF"
        />
      </div>
    </div>
  );
}
