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
import {
  getPublicPcoListsQuery,
  getPcoListQuery,
} from "@church-space/supabase/queries/all/get-pco-lists";
import { createClient } from "@church-space/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";

export default function ListSelector({
  value,
  onChange,
  organizationId,
}: {
  value: string;
  onChange: (value: string) => void;
  organizationId: string;
}) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const supabase = createClient();

  const { data: pcoLists, isLoading } = useQuery({
    queryKey: ["pcoLists", debouncedSearch],
    queryFn: () =>
      getPublicPcoListsQuery(supabase, organizationId, debouncedSearch),
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache is kept for 10 minutes
  });

  // Fetch the selected list if value is provided
  const { data: selectedListData } = useQuery({
    queryKey: ["pcoList", value],
    queryFn: () => getPcoListQuery(supabase, parseInt(value)),
    enabled: !!value, // Only run this query if value exists
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache is kept for 10 minutes
  });

  const lists = pcoLists?.data || [];
  const selectedList =
    selectedListData?.data?.[0] ||
    lists.find((list) => list.id.toString() === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedList?.pco_list_description || "Select a list..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search lists..."
            className="h-9"
            value={searchInput}
            onValueChange={setSearchInput}
          />
          <CommandList>
            <CommandEmpty className="py-6 text-center text-sm">
              {isLoading ? "Loading..." : "No list found."}
            </CommandEmpty>
            {lists.length > 0 && (
              <CommandGroup>
                {lists.map((list) => (
                  <CommandItem
                    key={list.id}
                    value={list.pco_list_description}
                    onSelect={() => {
                      onChange(list.id.toString());
                      setOpen(false);
                    }}
                  >
                    <div className="flex flex-col">
                      <div className="flex flex-row items-baseline gap-2">
                        <span>{list.pco_list_description} </span>
                        <span className="text-xs text-muted-foreground">
                          {list.pco_total_people}{" "}
                          {list.pco_total_people === "1" ? "person" : "people"}
                        </span>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {list.pco_list_categories?.pco_name}
                      </span>
                    </div>
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
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
