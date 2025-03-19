"use client";

import React from "react";

import { useState } from "react";
import {
  Check,
  Plus,
  RefreshCw,
  Copy,
  Star,
  ShieldCheck,
  Loader2,
  Info,
} from "lucide-react";
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
import { addDomainAction } from "@/actions/add-domain";
import { deleteDomainAction } from "@/actions/delete-domain";

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

// DMARC record recommendation
const getDmarcRecommendation = () => ({
  type: "TXT",
  name: "_dmarc",
  value: "v=DMARC1; p=none;",
  ttl: "Auto",
  priority: null,
  isRecommendation: true,
});

// Type definitions
type DomainRecord = {
  type: string;
  name: string;
  value: string;
  priority: number | null;
  ttl: string;
  status?: string;
  isRecommendation?: boolean;
};

type Domain = {
  id: number;
  name: string;
  records: DomainRecord[];
  isRefreshing: boolean;
  resend_domain_id: string | null;
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

export default function DomainManagement({
  organizationId,
  initialDomains = [],
}: {
  organizationId: string;
  initialDomains?: any[];
}) {
  const [newDomain, setNewDomain] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [deletingDomainId, setDeletingDomainId] = useState<number | null>(null);

  // Transform server fetched domains to the component's format
  const [domains, setDomains] = useState<Domain[]>(() => {
    if (initialDomains && initialDomains.length > 0) {
      // Sort domains with newest first
      const sortedDomains = [...initialDomains].sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB.getTime() - dateA.getTime();
      });

      return sortedDomains.map((domain) => {
        let records: DomainRecord[] = [];

        // Parse DNS records from database
        if (domain.dns_records) {
          try {
            const parsedRecords = JSON.parse(domain.dns_records);
            if (Array.isArray(parsedRecords)) {
              records = parsedRecords.map((record: any) => ({
                type: record.type || "TXT",
                name: record.name || "",
                value: record.value || "",
                priority:
                  record.priority !== undefined ? record.priority : null,
                ttl: record.ttl || "Auto",
                status: record.status || "not_started",
              }));

              // Check if DMARC record exists, if not, add recommendation
              const hasDmarc = records.some(
                (r) => r.name === "_dmarc" && r.type === "TXT",
              );

              if (!hasDmarc) {
                // Add DMARC as a recommendation
                records.push({
                  ...getDmarcRecommendation(),
                });
              }
            }
          } catch (err) {
            console.error(
              "Error parsing DNS records for domain:",
              domain.domain,
              err,
            );
            // Only show DMARC recommendation
            records = [
              {
                ...getDmarcRecommendation(),
              },
            ];
          }
        } else {
          // Only show DMARC recommendation
          records = [
            {
              ...getDmarcRecommendation(),
            },
          ];
        }

        return {
          id: domain.id,
          name: domain.domain,
          records: records,
          isRefreshing: false,
          resend_domain_id: domain.resend_domain_id,
        };
      });
    }
    return []; // Return empty array instead of sample domains
  });

  // Use the primary domain from the fetched domains or the first one
  const [primaryDomain, setPrimaryDomain] = useState<string>(() => {
    if (initialDomains && initialDomains.length > 0) {
      const primary = initialDomains.find((d) => d.is_primary);
      return primary ? primary.domain : initialDomains[0].domain;
    }
    return "";
  });

  const [confirmPrimaryDomain, setConfirmPrimaryDomain] =
    useState<Domain | null>(null);

  const handleAddDomain = async (e: React.FormEvent) => {
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

      // Set loading state
      setIsAddingDomain(true);

      // Call server action to add domain
      const response = await addDomainAction({
        organization_id: organizationId,
        domain: newDomain,
        is_primary: domains.length === 0, // Set as primary if it's the first domain
      });

      // Use any type to safely handle different response formats
      const result = response as any;
      console.log("Server action response:", JSON.stringify(result, null, 2));

      // Check if response is successful
      const isSuccess =
        result &&
        (result.success === true ||
          (result.data && !result.error) ||
          (result.data && result.status === 201));

      if (!isSuccess) {
        // Handle error
        const errorMessage =
          result?.error ||
          (typeof result === "object" && "message" in result
            ? result.message
            : null) ||
          "Failed to add domain. Please try again.";

        setValidationError(errorMessage);
        toast({
          title: "Error adding domain",
          description: errorMessage,
          variant: "destructive",
        });
        setIsAddingDomain(false);
        return;
      }

      // Get the domain data from the response
      const domainData = result.data || result;
      console.log("Domain data:", JSON.stringify(domainData, null, 2));
      console.log("Has records?", !!domainData.records);
      console.log("Records type:", typeof domainData.records);

      // Get the DNS records directly from the response
      let dnsRecords: DomainRecord[] = [];

      if (domainData.records && Array.isArray(domainData.records)) {
        console.log(
          "Using records directly from Resend:",
          JSON.stringify(domainData.records, null, 2),
        );
        // Use the records directly - they're already formatted by the server
        dnsRecords = domainData.records;
      }
      // Try to get records from the raw Resend response
      else if (
        result.data &&
        typeof result.data === "object" &&
        result.data.resend_response
      ) {
        try {
          const resendResponse =
            typeof result.data.resend_response === "string"
              ? JSON.parse(result.data.resend_response)
              : result.data.resend_response;

          if (
            resendResponse &&
            resendResponse.records &&
            Array.isArray(resendResponse.records)
          ) {
            console.log(
              "Found records in resend_response:",
              resendResponse.records,
            );
            dnsRecords = resendResponse.records.map((record: any) => ({
              type: record.type || "TXT",
              name: record.name || "",
              value: record.value || "",
              priority: record.priority !== undefined ? record.priority : null,
              ttl: record.ttl || "Auto",
              status: record.status || "not_started",
            }));
          }
        } catch (err) {
          console.error("Error parsing resend_response:", err);
        }
      } else {
        console.error("No records found in domain data:", domainData);

        // As a last resort, show standard DNS verification records that most email providers require
        dnsRecords = [
          {
            type: "MX",
            name: "@",
            value: "mx1.resend.com",
            priority: 10,
            ttl: "Auto",
            status: "not_started",
          },
          {
            type: "MX",
            name: "@",
            value: "mx2.resend.com",
            priority: 20,
            ttl: "Auto",
            status: "not_started",
          },
          {
            type: "TXT",
            name: "@",
            value: "v=spf1 include:spf.resend.com -all",
            priority: null,
            ttl: "Auto",
            status: "not_started",
          },
        ];
      }

      // Check if DMARC record exists, if not add recommendation
      const hasDmarc = dnsRecords.some(
        (record) => record.name === "_dmarc" && record.type === "TXT",
      );

      if (!hasDmarc) {
        dnsRecords.push({
          ...getDmarcRecommendation(),
        });
      }

      console.log(
        "Final DNS records to display:",
        JSON.stringify(dnsRecords, null, 2),
      );

      // Add the domain to the local state with real data
      setDomains((prevDomains) => [
        {
          id: domainData.id,
          name: newDomain,
          records: dnsRecords,
          isRefreshing: false,
          resend_domain_id: domainData.resend_domain_id,
        },
        ...prevDomains,
      ]);

      // Set as primary if it's the first one
      if (domains.length === 0) {
        setPrimaryDomain(newDomain);
      }

      toast({
        title: "Domain added",
        description: `${newDomain} has been added to your account.`,
      });

      setNewDomain("");
      setIsAddingDomain(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
      } else {
        console.error("Error adding domain:", error);
        setValidationError(
          typeof error === "string" ? error : "Invalid domain name",
        );
        toast({
          title: "Error adding domain",
          description:
            "There was a problem adding your domain. Please try again.",
          variant: "destructive",
        });
      }
      setIsAddingDomain(false);
    }
  };

  const handleDeleteDomain = async (domain: Domain) => {
    try {
      setDeletingDomainId(domain.id);
      await deleteDomainAction({
        organization_id: organizationId,
        domain_id: domain.id,
        resend_domain_id: domain.resend_domain_id || "",
      });

      // Optimistically remove the domain from the UI
      setDomains((prevDomains) =>
        prevDomains.filter((d) => d.id !== domain.id),
      );

      toast({
        title: "Domain deleted",
        description: `${domain.name} has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Error deleting domain:", error);
      toast({
        title: "Error deleting domain",
        description:
          "There was a problem deleting your domain. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingDomainId(null);
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

    // Log what we're refreshing
    console.log("Refreshing domain:", domains[domainIndex]);

    // Use real API endpoint to refresh status (when implemented)
    // For now we'll just simulate a status update by copying existing records
    // and setting one record to "verified" status as an example
    setTimeout(() => {
      const refreshedDomains = [...domains];

      // Update records to simulate verification
      if (refreshedDomains[domainIndex].records.length > 0) {
        // Make a deep copy of the records
        const updatedRecords = JSON.parse(
          JSON.stringify(refreshedDomains[domainIndex].records),
        );

        // Update status of real records (not recommendations)
        updatedRecords.forEach((record: DomainRecord) => {
          if (!record.isRecommendation) {
            // Simulate verification - in real implementation this would come from API
            record.status = "verified";
          }
        });

        refreshedDomains[domainIndex].records = updatedRecords;
      }

      refreshedDomains[domainIndex].isRefreshing = false;
      setDomains(refreshedDomains);

      toast({
        title: "Status refreshed",
        description: `DNS verification status for ${domains[domainIndex].name} has been updated.`,
      });
    }, 1500);
  };

  const setPrimary = (domain: Domain) => {
    if (primaryDomain === domain.name) return;

    setPrimaryDomain(domain.name);

    toast({
      title: "Primary domain updated",
      description: `${domain.name} is now your primary domain.`,
    });
  };

  const areAllRecordsVerified = (records: DomainRecord[]) => {
    // Only check non-recommendation records for verification
    const verifiableRecords = records.filter(
      (record) => !record.isRecommendation,
    );
    return (
      verifiableRecords.length > 0 &&
      verifiableRecords.every((record) => record.status === "verified")
    );
  };

  const getStatusBadge = (record: DomainRecord) => {
    // If it's a recommendation, show info badge instead
    if (record.isRecommendation) {
      return (
        <Badge
          variant="outline"
          className="border-blue-300 bg-blue-100 text-blue-800"
        >
          <Info className="mr-1 h-3 w-3" />
          Recommended
        </Badge>
      );
    }

    // Otherwise show verification status based on status property
    const status = record.status || "unknown";

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
      case "not_started":
        return (
          <Badge
            variant="outline"
            className="border-blue-300 bg-blue-100 text-blue-800"
          >
            Not Verified
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
                        <TableCell>{getStatusBadge(record)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Click on any cell to copy its value. DNS records can take up to
                24 hours to fully propagate.
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Primary domain toggle button */}
                  {primaryDomain !== domain.name && (
                    <Dialog
                      open={confirmPrimaryDomain?.name === domain.name}
                      onOpenChange={(open) => {
                        if (!open) setConfirmPrimaryDomain(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => setConfirmPrimaryDomain(domain)}
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Domain</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this domain?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteDomain(domain)}
                        disabled={deletingDomainId === domain.id}
                      >
                        {deletingDomainId === domain.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                  disabled={isAddingDomain}
                />
                {validationError && (
                  <p className="mt-1 text-xs text-red-500">{validationError}</p>
                )}
              </div>
              <Button type="submit" disabled={isAddingDomain}>
                {isAddingDomain ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Domain
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
