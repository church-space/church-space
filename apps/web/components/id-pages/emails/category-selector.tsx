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
  getAllEmailCategories,
  getEmailCategoryById,
} from "@church-space/supabase/queries/all/get-all-email-categories";
import { createClient } from "@church-space/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";

export default function CategorySelector({
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

  const { data: emailCategories, isLoading } = useQuery({
    queryKey: ["emailCategories", debouncedSearch],
    queryFn: () =>
      getAllEmailCategories(supabase, organizationId, {
        searchTerm: debouncedSearch,
      }),
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache is kept for 10 minutes
  });

  // Fetch the selected list if value is provided
  const { data: selectedListData } = useQuery({
    queryKey: ["emailCategory", value],
    queryFn: () =>
      getEmailCategoryById(supabase, organizationId, parseInt(value)),
    enabled: !!value, // Only run this query if value exists
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache is kept for 10 minutes
  });

  const categories = emailCategories?.data || [];
  const selectedCategory =
    selectedListData?.data?.[0] ||
    categories.find((category) => category.id.toString() === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="focus:z-10">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCategory?.name || "Select a category..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search categories..."
            className="h-9"
            value={searchInput}
            onValueChange={setSearchInput}
          />
          <CommandList>
            <CommandEmpty className="py-6 text-center text-sm">
              {isLoading ? "Loading..." : "No categories found."}
            </CommandEmpty>
            {categories.length > 0 && (
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.id.toString()}
                    onSelect={() => {
                      onChange(category.id.toString());
                      setOpen(false);
                    }}
                  >
                    <div className="flex flex-col">
                      <div className="flex flex-row items-baseline gap-2">
                        <span>{category.name} </span>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {category.description}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto",
                        value === category.id.toString()
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
