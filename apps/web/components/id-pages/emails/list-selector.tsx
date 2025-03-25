import { Button } from "@church-space/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@church-space/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@church-space/ui/command";
import { Check } from "lucide-react";
import { cn } from "@church-space/ui/cn";
import { ChevronsUpDown } from "lucide-react";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPcoListsQuery } from "@church-space/supabase/queries/all/get-pco-lists";
import { createClient } from "@church-space/supabase/client";

export default function ListSelector({
  value,
  onChange,
  organizationId,
}: {
  value: string;
  onChange: (value: string) => void;
  organizationId: string;
}) {
  const [audienceOpen, setAudienceOpen] = useState(false);
  const supabase = createClient();

  const { data: pcoLists } = useQuery({
    queryKey: ["pcoLists"],
    queryFn: () => getPcoListsQuery(supabase, organizationId),
  });

  return (
    <Popover open={audienceOpen} onOpenChange={setAudienceOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={audienceOpen}
          className="w-full justify-between"
        >
          {value
            ? pcoLists?.data?.find((list) => list.id.toString() === value)
                ?.pco_list_description || value
            : "Select a list..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search lists..." className="h-9" />
          <CommandList>
            <CommandEmpty>No list found.</CommandEmpty>
            <CommandGroup>
              {pcoLists?.data?.map((list) => (
                <CommandItem
                  key={list.id}
                  value={list.id.toString()}
                  onSelect={() => {
                    onChange(list.id.toString());
                    setAudienceOpen(false);
                  }}
                >
                  {list.pco_list_description}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === list.id.toString()
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
