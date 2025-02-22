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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@trivo/ui/select";

export default function AuthorForm() {
  const [openitem, setOpenitem] = useState<string | undefined>(undefined);
  const [items, setitems] = useState<
    Array<{
      title: string;
      description: string;
      label: string;
      buttonText: string;
      buttonLink: string;
      image: string;
    }>
  >([]);
  const additem = () => {
    const newIndex = items.length;
    setitems([
      ...items,
      {
        title: "",
        description: "",
        label: "",
        buttonText: "",
        buttonLink: "",
        image: "",
      },
    ]);
    setOpenitem(`item-${newIndex}`);
  };

  const removeitem = (index: number) => {
    setitems(items.filter((_, i) => i !== index));
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
          <Label>Text Color</Label>
          <Input className="col-span-2" type="color" />
          <Label>Bullet Color</Label>
          <Input className="col-span-2" type="color" />
          <Label>Bullet Type</Label>
          <Select>
            <SelectTrigger className="col-span-2">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="bullet">Bullet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-md">Items</Label>
          <Button variant="outline" onClick={additem}>
            Add Item
          </Button>
        </div>
        <Accordion
          type="single"
          collapsible
          value={openitem}
          onValueChange={setOpenitem}
        >
          {items.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>Item {index + 1}</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-3 gap-y-2 gap-x-2 items-center w-full p-2 border rounded-md pl-2.5">
                  <Label>Title</Label>
                  <Input className="col-span-2" placeholder="Title" />
                  <Label>Description</Label>
                  <Input className="col-span-2" placeholder="Description" />
                  <Button
                    variant="outline"
                    onClick={() => removeitem(index)}
                    className="col-span-3 mt-2"
                  >
                    Remove Item
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
