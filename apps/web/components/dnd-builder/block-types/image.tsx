import type { ImageBlockData } from "@/types/blocks";
import { createClient } from "@church-space/supabase/client";
import { cn } from "@church-space/ui/cn";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ImageBlockProps {
  data?: ImageBlockData;
}

export default function ImageBlock({ data }: ImageBlockProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const image = data?.image || "";
  const size = data?.size || 33;
  const centered = data?.centered || false;

  useEffect(() => {
    if (image) {
      const supabase = createClient();
      const { data: urlData } = supabase.storage
        .from("email_assets")
        .getPublicUrl(image);
      setImageUrl(urlData.publicUrl);
    }
  }, [image]);

  const Content = () => (
    <div
      className={cn(" rounded-md overflow-hidden ", centered && "mx-auto")}
      style={{ width: `${size}%` }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Uploaded content"
          className="w-full h-full object-contain "
          width={1000}
          height={1000}
        />
      ) : (
        <div className="aspect-video bg-background" />
      )}
    </div>
  );

  return <Content />;
}
