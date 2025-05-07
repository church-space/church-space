"use client";
import type { ImageBlockData } from "@/types/blocks";
import { createClient } from "@church-space/supabase/client";
import { cn } from "@church-space/ui/cn";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Image as ImageIcon } from "@church-space/ui/icons";

interface ImageBlockProps {
  data?: ImageBlockData;
  cornerRadius?: number;
}

export default function ImageBlock({ data, cornerRadius }: ImageBlockProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const image = data?.image || "";
  const size = data?.size || 33;
  const centered = data?.centered || false;

  useEffect(() => {
    if (image) {
      const supabase = createClient();
      const { data: urlData } = supabase.storage
        .from("organization-assets")
        .getPublicUrl(image);
      setImageUrl(urlData.publicUrl);
    } else {
      setImageUrl(""); // Clear the imageUrl when there is no image
    }
  }, [image]);

  const Content = () => (
    <div
      className={cn("overflow-hidden", centered && "mx-auto")}
      style={{ width: `${size}%`, borderRadius: `${cornerRadius}px` }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={"Uploaded content"}
          className="h-full w-full object-contain"
          width={1000}
          height={1000}
        />
      ) : (
        <div className="aspect-video bg-zinc-300">
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon fill="#000000" height={"50"} width={"50"} />
          </div>
        </div>
      )}
    </div>
  );

  return <Content />;
}
