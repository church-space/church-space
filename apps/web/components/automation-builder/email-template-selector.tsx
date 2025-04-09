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
import { getEmailTemplatesQuery } from "@church-space/supabase/queries/all/get-email-templates";
import { getEmailTemplateQuery } from "@church-space/supabase/queries/all/get-email-templates";
import { createClient } from "@church-space/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";

export default function EmailTemplateSelector({
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

  const { data: emailTemplatesData, isLoading } = useQuery({
    queryKey: ["emailTemplates", debouncedSearch],
    queryFn: () =>
      getEmailTemplatesQuery(supabase, organizationId, {
        searchTerm: debouncedSearch,
      }),
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache is kept for 10 minutes
  });

  // Fetch the selected template if value is provided
  const { data: selectedEmailTemplateData } = useQuery({
    queryKey: ["emailTemplate", value],
    queryFn: () =>
      getEmailTemplateQuery(supabase, organizationId, parseInt(value)),
    enabled: !!value, // Only run this query if value exists
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache is kept for 10 minutes
  });

  const emailTemplates = emailTemplatesData?.data || [];
  const selectedEmailTemplate =
    selectedEmailTemplateData?.data?.[0] ||
    emailTemplates.find((template) => template.id.toString() === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="focus:z-10">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedEmailTemplate?.subject || "Select a template..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search templates..."
            className="h-9"
            value={searchInput}
            onValueChange={setSearchInput}
          />
          <CommandList>
            <CommandEmpty className="py-6 text-center text-sm">
              {isLoading ? "Loading..." : "No template found."}
            </CommandEmpty>
            {emailTemplates.length > 0 && (
              <CommandGroup>
                {emailTemplates.map((template) => (
                  <CommandItem
                    key={template.id}
                    value={template.subject || ""}
                    onSelect={() => {
                      onChange(template.id.toString());
                      setOpen(false);
                    }}
                  >
                    <span>{template.subject} </span>

                    <Check
                      className={cn(
                        "ml-auto",
                        value === template.id.toString()
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
