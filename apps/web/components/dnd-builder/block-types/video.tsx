import React, { useState, useEffect } from "react";
import { PlayButton } from "@trivo/ui/icons";

export default function VideoBlock() {
  let videoUrl = "https://www.youtube.com/watch?v=FTwgWRWGhuI&list=WL&index=4";
  const [result, setResult] = useState({
    success: false,
    message: "",
    videoId: "",
  });

  useEffect(() => {
    const id = extractYouTubeId(videoUrl);
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
  }, [videoUrl]);

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

  return (
    <div className="relative">
      {result.success ? (
        <div className="bg-background aspect-video rounded-md">
          <img src={imageUrl} alt="Video Thumbnail" height={100} width={100} />
        </div>
      ) : (
        <div className="bg-background aspect-video rounded-md"></div>
      )}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-70">
        <PlayButton height="65" width="65" />
      </div>
    </div>
  );
}
