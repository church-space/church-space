import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@church-space/ui/button";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { Textarea } from "@church-space/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@church-space/ui/accordion";
import { useUser } from "@/stores/use-user";
import FileUpload from "../file-upload";
import type { Block, CardsBlockData } from "@/types/blocks";
import debounce from "lodash/debounce";
import { z } from "zod";
import ColorPicker from "../color-picker";

interface CardsFormProps {
  block: Block & { data?: CardsBlockData };
  onUpdate: (block: Block, addToHistory?: boolean) => void;
}

export default function CardsForm({ block, onUpdate }: CardsFormProps) {
  const { organizationId } = useUser();
  const [openCard, setOpenCard] = useState<string | undefined>(undefined);
  const [linkErrors, setLinkErrors] = useState<Record<number, string | null>>(
    {}
  );
  const [isTyping, setIsTyping] = useState<Record<number, boolean>>({});
  const debounceTimerRef = useRef<Record<number, NodeJS.Timeout | null>>({});

  const [localState, setLocalState] = useState<CardsBlockData>({
    title: block.data?.title || "Cards",
    subtitle: block.data?.subtitle || "Add a card to your page",
    cards: block.data?.cards || [],
    textColor: block.data?.textColor || "#000000",
    labelColor: block.data?.labelColor || "#4274D2",
    buttonColor: block.data?.buttonColor || "#4274D2",
    buttonTextColor: block.data?.buttonTextColor || "#FFFFFF",
  });

  // Create a ref to store the latest state for the debounced function
  const stateRef = useRef(localState);

  // Update the ref whenever localState changes
  useEffect(() => {
    stateRef.current = localState;
  }, [localState]);

  // Create a debounced function that only updates the history
  const debouncedHistoryUpdate = useCallback(
    debounce(() => {
      // Add to history
      onUpdate(
        {
          ...block,
          data: stateRef.current,
        },
        true
      );
    }, 500),
    [block, onUpdate]
  );

  // Cleanup the debounced function when component unmounts
  useEffect(() => {
    return () => {
      debouncedHistoryUpdate.cancel();
      // Clear all debounce timers
      Object.values(debounceTimerRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [debouncedHistoryUpdate]);

  // URL validation schema using Zod
  const urlSchema = z.string().superRefine((url, ctx) => {
    // Empty string is valid
    if (url === "") return;

    // Check for spaces
    if (url.trim() !== url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL cannot contain spaces",
      });
      return;
    }

    // Domain and TLD pattern without requiring https://
    const urlPattern =
      /^(https?:\/\/)?[a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}(\/.*)?$/;
    if (!urlPattern.test(url)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Please enter a valid URL with a domain and top-level domain (e.g., example.com)",
      });
      return;
    }
  });

  const validateUrl = (url: string, index: number) => {
    try {
      urlSchema.parse(url);
      setLinkErrors((prev) => ({ ...prev, [index]: null }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setLinkErrors((prev) => ({
          ...prev,
          [index]: error.errors[0].message,
        }));
        return false;
      }
      return true;
    }
  };

  const handleChange = (key: keyof CardsBlockData, value: any) => {
    // Immediately update the local state for responsive UI
    const newState = { ...localState, [key]: value };
    setLocalState(newState);

    // Update the UI immediately without adding to history
    onUpdate(
      {
        ...block,
        data: newState,
      },
      false
    );

    // Debounce the history update
    debouncedHistoryUpdate();
  };

  const addCard = () => {
    const newCards = [
      ...localState.cards,
      {
        title: "",
        description: "",
        label: "",
        buttonText: "",
        buttonLink: "",
        image: "",
      },
    ];
    handleChange("cards", newCards);
  };

  const updateCard = (index: number, key: string, value: string) => {
    const newCards = [...localState.cards];
    newCards[index] = { ...newCards[index], [key]: value };

    // For buttonLink field, handle typing state and validation
    if (key === "buttonLink") {
      setIsTyping((prev) => ({ ...prev, [index]: true }));

      // Clear any existing timer for this card
      if (debounceTimerRef.current[index]) {
        clearTimeout(debounceTimerRef.current[index]);
      }

      // Set a new timer to validate after typing stops
      debounceTimerRef.current[index] = setTimeout(() => {
        setIsTyping((prev) => ({ ...prev, [index]: false }));
        const isValid = validateUrl(value, index);

        // Only update parent if valid
        if (isValid) {
          handleChange("cards", newCards);
        }
      }, 800); // 800ms debounce

      // Still update local state for responsive UI
      setLocalState((prev) => ({
        ...prev,
        cards: newCards,
      }));
    } else {
      // For other fields, update immediately
      handleChange("cards", newCards);
    }
  };

  const handleBlur = (index: number) => {
    // When input loses focus, clear typing state and validate
    if (isTyping[index]) {
      setIsTyping((prev) => ({ ...prev, [index]: false }));

      if (debounceTimerRef.current[index]) {
        clearTimeout(debounceTimerRef.current[index]);
        debounceTimerRef.current[index] = null;
      }

      const buttonLink = localState.cards[index].buttonLink;
      const isValid = validateUrl(buttonLink, index);

      if (isValid) {
        // Update UI immediately without adding to history
        onUpdate(
          {
            ...block,
            data: localState,
          },
          false
        );

        // Debounce the history update
        debouncedHistoryUpdate();
      }
    }
  };

  const removeCard = (index: number) => {
    const newCards = localState.cards.filter((_, i) => i !== index);
    handleChange("cards", newCards);

    // Clean up any validation state for this card
    setLinkErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    setIsTyping((prev) => {
      const newTyping = { ...prev };
      delete newTyping[index];
      return newTyping;
    });

    if (debounceTimerRef.current[index]) {
      clearTimeout(debounceTimerRef.current[index]);
      delete debounceTimerRef.current[index];
    }
  };

  const onImageRemove = (index: number) => {
    // Update the card's image with an empty string
    const newCards = [...localState.cards];
    newCards[index] = { ...newCards[index], image: "" };
    handleChange("cards", newCards);

    // Force an update to history to ensure the change is saved
    debouncedHistoryUpdate();
  };

  if (!organizationId) return null;

  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center">
          <Label>Title</Label>
          <Input
            className="col-span-2"
            value={localState.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
          <Label>Subtitle</Label>
          <Input
            className="col-span-2"
            value={localState.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
          />
          <Label>Label Color</Label>
          <ColorPicker
            value={localState.labelColor}
            onChange={(color) => handleChange("labelColor", color)}
          />
          <Label>Button Color</Label>
          <ColorPicker
            value={localState.buttonColor}
            onChange={(color) => handleChange("buttonColor", color)}
          />
          <Label>Button Text Color</Label>
          <ColorPicker
            value={localState.buttonTextColor}
            onChange={(color) => handleChange("buttonTextColor", color)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Cards</Label>
          <Button variant="outline" onClick={addCard}>
            Add Card
          </Button>
        </div>
        <Accordion
          type="single"
          collapsible
          value={openCard}
          onValueChange={setOpenCard}
        >
          {localState.cards.map((card, index) => (
            <AccordionItem key={index} value={index.toString()}>
              <AccordionTrigger>
                {card.title ? card.title : `Card ${index + 1}`}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center py-1 pr-1">
                  <Label>Label</Label>
                  <Input
                    className="col-span-2"
                    value={card.label}
                    onChange={(e) => updateCard(index, "label", e.target.value)}
                  />
                  <Label>Title</Label>
                  <Input
                    className="col-span-2"
                    value={card.title}
                    onChange={(e) => updateCard(index, "title", e.target.value)}
                  />
                  <Label>Description</Label>
                  <Textarea
                    className="col-span-2"
                    value={card.description}
                    onChange={(e) =>
                      updateCard(index, "description", e.target.value)
                    }
                  />
                  <Label>Image</Label>
                  <div className="col-span-2">
                    <FileUpload
                      organizationId={organizationId}
                      onUploadComplete={(path) =>
                        updateCard(index, "image", path)
                      }
                      type="image"
                      initialFilePath={card.image}
                      onRemove={() => onImageRemove(index)}
                    />
                  </div>
                  <Label>Button Text</Label>
                  <Input
                    className="col-span-2"
                    value={card.buttonText}
                    onChange={(e) =>
                      updateCard(index, "buttonText", e.target.value)
                    }
                  />
                  <Label>Button Link</Label>
                  <div className="col-span-2 flex flex-col gap-1">
                    <Input
                      className={
                        linkErrors[index] && !isTyping[index]
                          ? "border-red-500"
                          : ""
                      }
                      value={card.buttonLink}
                      placeholder="https://..."
                      onChange={(e) =>
                        updateCard(index, "buttonLink", e.target.value)
                      }
                      onBlur={() => handleBlur(index)}
                    />
                    {linkErrors[index] && !isTyping[index] && (
                      <p className="text-xs text-red-500">
                        {linkErrors[index]}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => removeCard(index)}
                    className="col-span-3 mt-2"
                  >
                    Remove Card
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
