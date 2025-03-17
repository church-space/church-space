"use client";

import { useState } from "react";
import { Button } from "@church-space/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";
import { toast } from "@church-space/ui/use-toast";

export default function DnsPresets() {
  const [loading, setLoading] = useState(false);

  const presets = [
    { name: "Google Workspace", id: "google" },
    { name: "Microsoft 365", id: "microsoft" },
    { name: "Zoho Mail", id: "zoho" },
    { name: "ProtonMail", id: "proton" },
    { name: "Bluesky", id: "bluesky" },
    { name: "Cloudflare Email Routing", id: "cloudflare" },
  ];

  const handleSelectPreset = (presetId: string) => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);

      toast({
        title: "DNS Preset Applied",
        description: `DNS records for the selected service have been added to your domain.`,
      });
    }, 1000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          {loading ? "Applying..." : "Add DNS Preset"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Email & Service Presets</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {presets.map((preset) => (
            <DropdownMenuItem
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
            >
              {preset.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs text-muted-foreground">
          Vercel does not provide email services [^3]
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
