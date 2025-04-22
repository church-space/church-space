import type { CardsBlockData } from "@/types/blocks";
import { createClient } from "@church-space/supabase/client";
import { cn } from "@church-space/ui/cn";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface CardsBlockProps {
  data?: CardsBlockData;
  defaultFont?: string;
  defaultTextColor?: string;
  isRounded?: boolean;
}

export default function CardsBlock({
  data,
  defaultFont,
  defaultTextColor,
  isRounded,
}: CardsBlockProps) {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const title = data?.title;
  const subtitle = data?.subtitle;

  // Memoize the cards array to prevent it from changing on every render
  const cards = useMemo(() => {
    const cardsArray = data?.cards || [];
    return [...cardsArray].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [data?.cards]);

  useEffect(() => {
    const supabase = createClient();

    // Get public URLs for all card images
    cards.forEach((card) => {
      if (card.image && !imageUrls[card.image]) {
        const { data: urlData } = supabase.storage
          .from("organization-assets")
          .getPublicUrl(card.image);
        setImageUrls((prev) => ({
          ...prev,
          [card.image]: urlData.publicUrl,
        }));
      }
    });
  }, [cards, imageUrls]);

  return (
    <div
      className="flex flex-col gap-5 py-2"
      style={{ fontFamily: defaultFont || "inherit" }}
    >
      {title ||
        (subtitle && (
          <div className="flex flex-col">
            {title !== undefined && (
              <span
                className="text-3xl font-bold"
                style={{ color: defaultTextColor }}
              >
                {title !== "" && title}
              </span>
            )}
            {subtitle !== undefined && (
              <span
                className="text-md text-muted-foreground"
                style={{ color: defaultTextColor }}
              >
                {subtitle !== "" && subtitle}
              </span>
            )}
          </div>
        ))}
      <div className="grid grid-cols-1 gap-4 gap-y-4 sm:grid-cols-2">
        {cards.map((card, index) => (
          <div className="flex w-full flex-col gap-1" key={index}>
            {card.image && imageUrls[card.image] && (
              <Image
                src={imageUrls[card.image]}
                alt={card.title}
                className={cn(
                  "w-full object-cover",
                  isRounded && "rounded-md",
                  data?.imageAspectRatio === "16:9" && "aspect-video",
                  data?.imageAspectRatio === "square" && "aspect-square",
                )}
                width={data?.imageAspectRatio === "16:9" ? 1280 : 1024}
                height={data?.imageAspectRatio === "16:9" ? 720 : 1024}
              />
            )}
            <div className="flex flex-col gap-0.5 px-1">
              <h3
                className="text-sm font-medium"
                style={{ color: data?.labelColor }}
              >
                {card.label}
              </h3>
              <h3
                className="text-lg font-bold"
                style={{ color: defaultTextColor }}
              >
                {card.title && card.title}
              </h3>
              <p
                className="pb-2 text-sm text-muted-foreground"
                style={{ color: defaultTextColor }}
              >
                {card.description && card.description}
              </p>
            </div>
            {card.buttonText && (
              <div
                className={cn(
                  "mb-2 flex min-h-8 items-center justify-center text-balance px-4 py-1 text-center text-sm font-medium",
                  isRounded && "rounded-md",
                )}
                style={{
                  backgroundColor: data?.buttonColor,
                  color: data?.buttonTextColor,
                }}
              >
                {card.buttonText}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
