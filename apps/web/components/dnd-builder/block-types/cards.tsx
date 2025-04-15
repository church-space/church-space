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
  const cards = useMemo(() => data?.cards || [], [data?.cards]);

  useEffect(() => {
    const supabase = createClient();

    // Get public URLs for all card images
    cards.forEach((card) => {
      if (card.image && !imageUrls[card.image]) {
        const { data: urlData } = supabase.storage
          .from("email_assets")
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
      <div className="flex flex-col">
        {title !== undefined && (
          <span
            className="text-3xl font-bold"
            style={{ color: defaultTextColor }}
          >
            {title === "" ? (
              <span className="text-muted-foreground">Title</span>
            ) : (
              title
            )}
          </span>
        )}
        {subtitle !== undefined && (
          <span
            className="text-muted-foreground"
            style={{ color: defaultTextColor }}
          >
            {subtitle === "" ? (
              <span className="text-muted-foreground">Subtitle</span>
            ) : (
              subtitle
            )}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-6 gap-y-14 lg:grid-cols-2">
        {cards.map((card, index) => (
          <div className="flex w-full flex-col gap-1" key={index}>
            {card.image && imageUrls[card.image] && (
              <Image
                src={imageUrls[card.image]}
                alt={card.title}
                className={cn(
                  "h-48 w-full object-cover",
                  isRounded && "rounded-md",
                )}
                width={1280}
                height={720}
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
                {card.title === "" ? (
                  <span className="text-muted-foreground">Card Title</span>
                ) : (
                  card.title
                )}
              </h3>
              <p
                className="text-sm text-muted-foreground"
                style={{ color: defaultTextColor }}
              >
                {card.description === "" ? (
                  <span className="text-muted-foreground">
                    Card Description
                  </span>
                ) : (
                  card.description
                )}
              </p>
            </div>
            {card.buttonText && (
              <div
                className={cn(
                  "mt-2 flex min-h-8 items-center justify-center text-balance px-4 py-1 text-center text-sm font-medium",
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
