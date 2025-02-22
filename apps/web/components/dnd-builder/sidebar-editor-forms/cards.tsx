import { useState } from "react";
import { Button } from "@trivo/ui/button";
import { Input } from "@trivo/ui/input";
import { Label } from "@trivo/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@trivo/ui/accordion";
export default function AuthorForm() {
  const [openCard, setOpenCard] = useState<string | undefined>(undefined);
  const [cards, setCards] = useState<
    Array<{
      title: string;
      description: string;
      label: string;
      buttonText: string;
      buttonLink: string;
      image: string;
    }>
  >([]);
  const addCard = () => {
    const newIndex = cards.length;
    setCards([
      ...cards,
      {
        title: "",
        description: "",
        label: "",
        buttonText: "",
        buttonLink: "",
        image: "",
      },
    ]);
    setOpenCard(`card-${newIndex}`);
  };

  const removeCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-10 px-2">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Details</Label>
        </div>
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 items-center ">
          <Label>Title</Label>
          <Input className="col-span-2" placeholder="Name" />
          <Label>Subtitle</Label>
          <Input className="col-span-2" placeholder="Title" />
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
          {cards.map((card, index) => (
            <AccordionItem key={index} value={`card-${index}`}>
              <AccordionTrigger>Card {index + 1}</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-3 gap-y-2 gap-x-2 items-center w-full p-2 border rounded-md pl-2.5">
                  <Label>Title</Label>
                  <Input className="col-span-2" placeholder="Title" />
                  <Label>Description</Label>
                  <Input className="col-span-2" placeholder="Description" />
                  <Label>Label</Label>
                  <Input className="col-span-2" placeholder="Label" />
                  <Label>Button Text</Label>
                  <Input className="col-span-2" placeholder="Button Text" />
                  <Label>Button Link</Label>
                  <Input className="col-span-2" placeholder="Button Link" />
                  <Label>Image</Label>
                  <Input className="col-span-2" type="file" />
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
