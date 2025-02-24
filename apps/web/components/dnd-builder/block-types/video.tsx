import React, { useState, useEffect } from "react";
import { PlayButton, Youtube } from "@trivo/ui/icons";
import { VideoBlockData } from "@/types/blocks";

interface VideoBlockProps {
  data?: VideoBlockData;
}

export default function VideoBlock({ data }: VideoBlockProps) {
  const [result, setResult] = useState({
    success: false,
    message: "",
    videoId: "",
  });

  useEffect(() => {
    if (!data?.url) return;

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
  }, [data?.url]);

  const extractYouTubeId = (url: string) => {
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
  };

  const imageUrl = `https://i3.ytimg.com/vi/${result.videoId}/maxresdefault.jpg`;
  const style = {
    maxWidth: data?.size ? `${data.size}%` : "33%",
    margin: data?.centered ? "0 auto" : undefined,
  };

  return (
    <div className="relative" style={style}>
      {result.success ? (
        <div className="bg-background aspect-video rounded-md">
          <img
            src={imageUrl}
            alt="Video Thumbnail"
            className="w-full h-full object-cover rounded-md"
          />
        </div>
      ) : (
        <div className="bg-background aspect-video rounded-md"></div>
      )}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <div className="relative">
          <div className="absolute top-5 left-5 w-10 h-8 bg-white rounded-full" />
          <div className="relative z-10">
            <Youtube height="80" width="80" fill="#FF0000" />
          </div>
        </div>
      </div>
    </div>
  );
}
