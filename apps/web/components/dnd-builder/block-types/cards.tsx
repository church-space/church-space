import React, { useEffect, useState } from "react";
import { Button } from "@trivo/ui/button";
import type { CardsBlockData } from "@/types/blocks";
import { createClient } from "@trivo/supabase/client";

interface CardsBlockProps {
  data?: CardsBlockData;
}

export default function CardsBlock({ data }: CardsBlockProps) {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const title = data?.title || "Cards";
  const subtitle = data?.subtitle || "Add a card to your page";
  const cards = data?.cards || [];

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
  }, [cards]);

  return (
    <div className="flex flex-col gap-1 py-4">
      <div className="flex flex-col">
        <span className="text-xl font-bold">{title}</span>
        <span className="text-sm text-muted-foreground">{subtitle}</span>
      </div>
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-2 gap-y-10">
        {cards.map((card, index) => (
          <div className="w-full flex flex-col gap-2" key={index}>
            {card.image && (
              <img
                src={imageUrls[card.image] || ""}
                alt={card.title}
                className="w-full h-48 object-cover rounded-md"
              />
            )}
            <div className="flex flex-col px-1 gap-0.5">
              <h3 className="text-sm font-medium text-blue-500">
                {card.label}
              </h3>
              <h3 className="text-lg font-bold">{card.title}</h3>
              <p className="text-sm text-muted-foreground">
                {card.description}
              </p>
            </div>
            {card.buttonText && (
              <Button variant="outline" asChild>
                <a href={card.buttonLink}>{card.buttonText}</a>
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
