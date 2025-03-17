"use client";

import React from "react";

import { useState } from "react";
import { Check, Plus, RefreshCw, Copy, Star, ShieldCheck } from "lucide-react";
import { Button } from "@church-space/ui/button";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@church-space/ui/table";
import { toast } from "@church-space/ui/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@church-space/ui/accordion";
import { Badge } from "@church-space/ui/badge";
import { z } from "zod";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@church-space/ui/tooltip";
import { cn } from "@church-space/ui/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";

// Domain validation schema
const domainSchema = z.string().refine(
  (val) => {
    // Basic domain validation regex
    const domainRegex =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return domainRegex.test(val);
  },
  {
    message: "Please enter a valid domain name (e.g., example.com)",
  },
);

// Sample DNS records for a domain
const getSampleRecords = (domain: string, allVerified = false) => [
  {
    type: "MX",
    name: "@",
    value: "mx1.vercel-smtp.com",
    priority: 10,
    ttl: 3600,
    status: "verified",
  },
  {
    type: "MX",
    name: "@",
    value: "mx2.vercel-smtp.com",
    priority: 20,
    ttl: 3600,
    status: "verified",
  },
  {
    type: "TXT",
    name: "@",
    value: `v=spf1 include:_spf.${domain} ~all`,
    priority: null,
    ttl: 3600,
    status: "verified",
  },
  {
    type: "TXT",
    name: "verification",
    value: `vercel-domain-verification=${Math.random().toString(36).substring(2, 15)}`,
    priority: null,
    ttl: 3600,
    status: allVerified ? "verified" : "pending",
  },
  {
    type: "TXT",
    name: "dkim",
    value:
      "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCrLHiExVd55zd/IQ/J",
    priority: null,
    ttl: 3600,
    status: allVerified ? "verified" : "failed",
  },
  {
    type: "A",
    name: "@",
    value: "76.76.21.21",
    priority: null,
    ttl: 3600,
    status: "verified",
  },
];

type Domain = {
  name: string;
  records: {
    type: string;
    name: string;
    value: string;
    priority: number | null;
    ttl: number;
    status: string;
  }[];
  isRefreshing: boolean;
};

// Custom AccordionTrigger that only underlines the domain name
const CustomAccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof AccordionTrigger>
>(({ className, children, ...props }, ref) => (
  <AccordionTrigger
    ref={ref}
    className={cn("group no-underline", className)}
    {...props}
  >
    {children}
  </AccordionTrigger>
));
CustomAccordionTrigger.displayName = "CustomAccordionTrigger";

export default function DomainManagement() {
  const [newDomain, setNewDomain] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const [primaryDomain, setPrimaryDomain] = useState<string>("example.com");
  const [domains, setDomains] = useState<Domain[]>([
    {
      name: "example.com",
      records: getSampleRecords("example.com", true), // All verified for the first domain
      isRefreshing: false,
    },
    {
      name: "myproject.dev",
      records: getSampleRecords("myproject.dev"), // Some pending/failed for the second domain
      isRefreshing: false,
    },
  ]);

  const [confirmPrimaryDomain, setConfirmPrimaryDomain] = useState<
    string | null
  >(null);

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;

    try {
      // Validate domain with Zod
      domainSchema.parse(newDomain);
      setValidationError(null);

      // Check if domain already exists
      if (domains.some((d) => d.name === newDomain)) {
        setValidationError("This domain is already added");
        return;
      }

      // Add new domain with sample records
      setDomains([
        ...domains,
        {
          name: newDomain,
          records: getSampleRecords(newDomain),
          isRefreshing: false,
        },
      ]);

      toast({
        title: "Domain added",
        description: `${newDomain} has been added to your account.`,
      });

      setNewDomain("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
      } else {
        setValidationError("Invalid domain name");
      }
    }
  };

  const copyToClipboard = (text: string, cellId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCell(cellId);

    toast({
      title: "Copied to clipboard",
      description: "Value has been copied to your clipboard.",
    });

    setTimeout(() => {
      setCopiedCell(null);
    }, 2000);
  };

  const refreshStatus = (domainIndex: number) => {
    const updatedDomains = [...domains];
    updatedDomains[domainIndex].isRefreshing = true;
    setDomains(updatedDomains);

    // Simulate API call to refresh status
    setTimeout(() => {
      const refreshedDomains = [...domains];
      refreshedDomains[domainIndex].isRefreshing = false;
      setDomains(refreshedDomains);

      toast({
        title: "Status refreshed",
        description: `DNS verification status for ${domains[domainIndex].name} has been updated.`,
      });
    }, 1500);
  };

  const setPrimary = (domainName: string) => {
    if (primaryDomain === domainName) return;

    setPrimaryDomain(domainName);

    toast({
      title: "Primary domain updated",
      description: `${domainName} is now your primary domain.`,
    });
  };

  const areAllRecordsVerified = (records: Domain["records"]) => {
    return records.every((record) => record.status === "verified");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="success" className="bg-green-500">
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-yellow-300 bg-yellow-100 text-yellow-800"
          >
            Pending
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="mx-auto w-full py-6">
      <Accordion type="single" defaultValue="domain-0" className="space-y-4">
        {domains.map((domain, domainIndex) => (
          <AccordionItem key={domain.name} value={`domain-${domainIndex}`}>
            <CustomAccordionTrigger className="font-medium hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="group-hover:underline">{domain.name}</span>

                {/* Primary domain indicator */}
                {primaryDomain === domain.name && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="border-blue-300 bg-blue-100 text-blue-800"
                        >
                          <Star className="mr-1 h-3 w-3 fill-blue-500 text-blue-500" />
                          Primary
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This is your primary domain</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Verification badge */}
                {areAllRecordsVerified(domain.records) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="border-green-300 bg-green-100 text-green-800"
                        >
                          <ShieldCheck className="mr-1 h-3 w-3 text-green-500" />
                          Verified
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>All DNS records are verified</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </CustomAccordionTrigger>
            <AccordionContent>
              <div className="mb-4 flex items-center gap-2">
                {/* Primary domain toggle button */}
                {primaryDomain !== domain.name && (
                  <Dialog
                    open={confirmPrimaryDomain === domain.name}
                    onOpenChange={(open) => {
                      if (!open) setConfirmPrimaryDomain(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setConfirmPrimaryDomain(domain.name)}
                      >
                        <Star className="mr-1 h-3.5 w-3.5" />
                        Set as Primary
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Set as Primary Domain</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to set {domain.name} as your
                          primary domain? This will be used as the default
                          domain for your project.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setConfirmPrimaryDomain(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirmPrimaryDomain) {
                              setPrimary(confirmPrimaryDomain);
                              setConfirmPrimaryDomain(null);
                            }
                          }}
                        >
                          Confirm
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Refresh status button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshStatus(domainIndex)}
                  disabled={domain.isRefreshing}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${domain.isRefreshing ? "animate-spin" : ""}`}
                  />
                  {domain.isRefreshing ? "Refreshing..." : "Refresh Status"}
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>TTL</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domain.records.map((record, recordIndex) => (
                      <TableRow key={`${domain.name}-record-${recordIndex}`}>
                        <TableCell
                          className="group relative cursor-pointer font-medium"
                          onClick={() =>
                            copyToClipboard(
                              record.type,
                              `${domain.name}-type-${recordIndex}`,
                            )
                          }
                        >
                          <span>{record.type}</span>
                          {copiedCell ===
                          `${domain.name}-type-${recordIndex}` ? (
                            <div className="absolute inset-0 flex items-center justify-end bg-muted/20 pr-2">
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-end bg-muted/20 pr-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell
                          className="group relative cursor-pointer hover:bg-muted/50"
                          onClick={() =>
                            copyToClipboard(
                              record.name,
                              `${domain.name}-name-${recordIndex}`,
                            )
                          }
                        >
                          <span>{record.name}</span>
                          {copiedCell ===
                          `${domain.name}-name-${recordIndex}` ? (
                            <div className="absolute inset-0 flex items-center justify-end bg-muted/20 pr-2">
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-end bg-muted/20 pr-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell
                          className="group relative max-w-[200px] cursor-pointer truncate font-mono text-sm hover:bg-muted/50"
                          onClick={() =>
                            copyToClipboard(
                              record.value,
                              `${domain.name}-value-${recordIndex}`,
                            )
                          }
                        >
                          <span>{record.value}</span>
                          {copiedCell ===
                          `${domain.name}-value-${recordIndex}` ? (
                            <div className="absolute inset-0 flex items-center justify-end bg-muted/20 pr-2">
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-end bg-muted/20 pr-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell
                          className="group relative cursor-pointer hover:bg-muted/50"
                          onClick={() =>
                            record.priority !== null &&
                            copyToClipboard(
                              record.priority.toString(),
                              `${domain.name}-priority-${recordIndex}`,
                            )
                          }
                        >
                          <span>
                            {record.priority !== null ? record.priority : "-"}
                          </span>
                          {record.priority !== null &&
                            (copiedCell ===
                            `${domain.name}-priority-${recordIndex}` ? (
                              <div className="absolute inset-0 flex items-center justify-end bg-muted/20 pr-2">
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-end bg-muted/20 pr-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                            ))}
                        </TableCell>
                        <TableCell
                          className="group relative cursor-pointer hover:bg-muted/50"
                          onClick={() =>
                            copyToClipboard(
                              record.ttl.toString(),
                              `${domain.name}-ttl-${recordIndex}`,
                            )
                          }
                        >
                          <span>{record.ttl}</span>
                          {copiedCell ===
                          `${domain.name}-ttl-${recordIndex}` ? (
                            <div className="absolute inset-0 flex items-center justify-end bg-muted/20 pr-2">
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-end bg-muted/20 pr-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Click on any cell to copy its value. DNS records can take up to
                24 hours to fully propagate. [^1]
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-4 border-t pt-4">
        <form onSubmit={handleAddDomain} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="domain">Add New Domain</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => {
                    setNewDomain(e.target.value);
                    setValidationError(null);
                  }}
                  className={validationError ? "border-red-500" : ""}
                />
                {validationError && (
                  <p className="mt-1 text-xs text-red-500">{validationError}</p>
                )}
              </div>
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Add Domain
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              To manage DNS records, your domain needs to use Vercel's
              nameservers. [^2]
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
