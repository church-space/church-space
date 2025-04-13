"use client";

import React from "react";

import { useState, useEffect } from "react";
import {
  Check,
  Plus,
  RefreshCw,
  Copy,
  Star,
  ShieldCheck,
  Loader2,
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
import { verifyDomainAction } from "@/actions/verify-domain";
import type { ActionResponse } from "@/types/action";
import { updateDomainsAction } from "@/actions/update-domains";

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
  isPrimary?: boolean;
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
  const [deleteConfirmInput, setDeleteConfirmInput] = useState<string>("");

  const [refreshingDomains, setRefreshingDomains] = useState<
    Record<number, { isRefreshing: boolean; cooldown: number }>
  >({});

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
          isPrimary: domain.is_primary === true, // Ensure proper boolean conversion
        };
      });
    }
    return []; // Return empty array instead of sample domains
  });

  // Domain limit constant
  const MAX_DOMAINS = 5;
  const isMaxDomainsReached = domains.length >= MAX_DOMAINS;

  // Use the primary domain from the fetched domains
  const [primaryDomain, setPrimaryDomain] = useState<string>(() => {
    if (initialDomains && initialDomains.length > 0) {
      const primary = initialDomains.find((d) => d.is_primary === true);
      return primary ? primary.domain : initialDomains[0].domain;
    }
    return "";
  });

  const [confirmPrimaryDomain, setConfirmPrimaryDomain] =
    useState<Domain | null>(null);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);

  // Effect to count down the cooldown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshingDomains((prevState) => {
        const newState = { ...prevState };
        let updated = false;

        Object.keys(newState).forEach((domainId) => {
          const id = Number(domainId);
          if (newState[id].cooldown > 0) {
            newState[id] = {
              ...newState[id],
              cooldown: newState[id].cooldown - 1,
            };
            updated = true;
          }
        });

        return updated ? newState : prevState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

      try {
        // Extract data from response
        const domainData = result.data.data;

        console.log("Domain data from server action:", domainData);

        // Add the domain to the local state with ALL records from the response
        setDomains((prevDomains) => [
          {
            id: domainData.id,
            name: newDomain,
            records: [
              ...domainData.records, // Add all records from the response first
              // Then add DMARC recommendation if it doesn't exist
              ...(!domainData.records.some(
                (r: any) => r.name === "_dmarc" && r.type === "TXT",
              )
                ? [getDmarcRecommendation()]
                : []),
            ],
            isRefreshing: false,
            resend_domain_id: domainData.resend_domain_id,
            isPrimary: !!domainData.is_primary || prevDomains.length === 0,
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
        console.error("Error processing domain response:", error);
        toast({
          title: "Error processing domain data",
          description:
            "The domain was added but there was an error displaying DNS records.",
          variant: "destructive",
        });
        setIsAddingDomain(false);
      }
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

  const refreshStatus = async (domainIndex: number) => {
    const domain = domains[domainIndex];
    const domainId = domain.id;

    // Check if we're in cooldown
    if (refreshingDomains[domainId]?.cooldown > 0) {
      toast({
        title: "Please wait",
        description: `You can refresh again in ${refreshingDomains[domainId].cooldown} seconds.`,
        variant: "default",
      });
      return;
    }

    // Set refreshing state
    setRefreshingDomains((prev) => ({
      ...prev,
      [domainId]: { isRefreshing: true, cooldown: 10 },
    }));

    try {
      // Make sure we have the Resend domain ID
      if (!domain.resend_domain_id) {
        throw new Error("No Resend domain ID found for this domain");
      }

      // Call the verify domain action
      const response = await verifyDomainAction({
        domain_id: domainId,
        resend_domain_id: domain.resend_domain_id,
      });

      // Cast to any to handle the response structure
      const result = response as any;

      if (!result || result.success === false) {
        throw new Error(result?.error || "Failed to verify domain");
      }

      // Extract domain data from the response
      const domainData = result.data?.data.domain;
      const resendData = result.data?.data.resendData;

      console.log("Domain verification response:", {
        domain: domainData,
        resendData: resendData,
      });

      // Update the domain records in the local state
      const updatedDomains = [...domains];

      // First try to use resendData if it's available
      if (resendData?.records && Array.isArray(resendData.records)) {
        // Map the Resend records to our DomainRecord format
        const formattedRecords = resendData.records.map((record: any) => ({
          type: record.type || "TXT",
          name: record.name || "",
          value: record.value || "",
          priority: record.priority !== undefined ? record.priority : null,
          ttl: record.ttl || "Auto",
          status: record.status || "not_started",
        }));

        // Check if DMARC record exists, if not, add recommendation
        const hasDmarc = formattedRecords.some(
          (record: DomainRecord) =>
            record.name === "_dmarc" && record.type === "TXT",
        );

        if (!hasDmarc) {
          // Add DMARC as a recommendation with required status property
          formattedRecords.push({
            ...getDmarcRecommendation(),
            status: "not_started",
          });
        }

        // Update the domain's records
        updatedDomains[domainIndex].records = formattedRecords;
        setDomains(updatedDomains);
      }
      // Fall back to domain.dns_records if resendData is not available
      else if (domainData?.dns_records) {
        try {
          const parsedRecords = JSON.parse(domainData.dns_records);
          if (Array.isArray(parsedRecords)) {
            const formattedRecords = parsedRecords.map((record: any) => ({
              type: record.type || "TXT",
              name: record.name || "",
              value: record.value || "",
              priority: record.priority !== undefined ? record.priority : null,
              ttl: record.ttl || "Auto",
              status: record.status || "not_started",
            }));

            // Check if DMARC record exists, if not, add recommendation
            const hasDmarc = formattedRecords.some(
              (record: DomainRecord) =>
                record.name === "_dmarc" && record.type === "TXT",
            );

            if (!hasDmarc) {
              formattedRecords.push({
                ...getDmarcRecommendation(),
                status: "not_started",
              });
            }

            // Update the domain's records
            updatedDomains[domainIndex].records = formattedRecords;
            setDomains(updatedDomains);
          }
        } catch (parseError) {
          console.error("Error parsing DNS records:", parseError);
        }
      }

      toast({
        title: "Status refreshed",
        description: `DNS verification status for ${domain.name} has been updated.`,
      });
    } catch (error) {
      console.error("Error refreshing domain status:", error);
      toast({
        title: "Error refreshing status",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while refreshing DNS status.",
        variant: "destructive",
      });
    } finally {
      // Set not refreshing and start cooldown
      setRefreshingDomains((prev) => ({
        ...prev,
        [domainId]: { isRefreshing: false, cooldown: 10 },
      }));
    }
  };

  const setPrimary = async (domain: Domain) => {
    if (primaryDomain === domain.name) return;

    try {
      setIsSettingPrimary(true);

      // Call the updateDomainsAction to update the domain as primary
      const response = await updateDomainsAction({
        domain_id: domain.id,
        domain_data: {
          is_primary: true,
        },
      });

      console.log("Set primary response:", response);

      // Cast response to ActionResponse type to access expected properties
      const typedResponse = response as ActionResponse;

      // Since response structure might vary, check for both patterns
      // We consider it successful if:
      // 1. It has success:true OR
      // 2. It has data and no error
      const isSuccess =
        (typedResponse && typedResponse.success === true) ||
        (typedResponse && typedResponse.data && !typedResponse.error);

      if (isSuccess) {
        console.log(`Setting ${domain.name} as primary`);

        // Update the primaryDomain state
        setPrimaryDomain(domain.name);

        // Update all domains to reflect the new primary status
        setDomains((prevDomains) => {
          console.log("Updating domains primary status");
          return prevDomains.map((d) => ({
            ...d,
            isPrimary: d.id === domain.id,
          }));
        });

        toast({
          title: "Primary domain updated",
          description: `${domain.name} is now your primary domain.`,
        });
      } else {
        console.error("Failed to set primary domain:", response);
        const errorMessage =
          typedResponse && typeof typedResponse.error === "string"
            ? typedResponse.error
            : "Failed to set primary domain";
        toast({
          title: "Error updating primary domain",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error setting primary domain:", error);
      toast({
        title: "Error updating primary domain",
        description: "Failed to set primary domain. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSettingPrimary(false);
      setConfirmPrimaryDomain(null);
    }
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="border bg-muted text-muted-foreground"
            >
              Recommended
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Adding this record will help improve your email deliverability.
            </p>
          </TooltipContent>
        </Tooltip>
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
    <div className="mx-auto w-full py-3">
      <Accordion type="single" defaultValue="" className="space-y-4">
        {domains.map((domain, domainIndex) => (
          <AccordionItem
            defaultValue={domain.isPrimary ? "domain-0" : undefined}
            key={domain.name}
            value={`domain-${domainIndex}`}
          >
            <CustomAccordionTrigger className="font-medium hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="group-hover:underline">{domain.name}</span>

                {/* Primary domain indicator */}
                {domain.isPrimary && (
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
                <div className="max-h-[400px] overflow-y-auto">
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
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Click on any cell to copy its value. DNS records can take up to
                24 hours to fully propagate.
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Primary domain toggle button */}
                  {!domain.isPrimary && (
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
                            domain for your church.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setConfirmPrimaryDomain(null)}
                            disabled={isSettingPrimary}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => setPrimary(domain)}
                            disabled={isSettingPrimary}
                          >
                            {isSettingPrimary ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Setting...
                              </>
                            ) : (
                              "Confirm"
                            )}
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
                    disabled={
                      refreshingDomains[domain.id]?.isRefreshing ||
                      refreshingDomains[domain.id]?.cooldown > 0
                    }
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${refreshingDomains[domain.id]?.isRefreshing ? "animate-spin" : ""}`}
                    />
                    {refreshingDomains[domain.id]?.isRefreshing
                      ? "Refreshing..."
                      : refreshingDomains[domain.id]?.cooldown > 0
                        ? `Please wait ${refreshingDomains[domain.id].cooldown} seconds`
                        : "Refresh"}
                  </Button>
                </div>
                <Dialog
                  onOpenChange={(open) => {
                    if (open) {
                      setDeleteConfirmInput("");
                    } else {
                      setDeleteConfirmInput("");
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Domain</DialogTitle>
                      <DialogDescription>
                        To delete this domain, please type the domain in the
                        input below to confirm.{" "}
                        <b>This action cannot be undone.</b>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                      <div className="rounded-md border bg-card p-4 px-5 text-sm font-semibold text-foreground">
                        {domain.name}
                      </div>
                      <Input
                        className="mt-2"
                        value={deleteConfirmInput}
                        placeholder={domain.name}
                        onChange={(e) => setDeleteConfirmInput(e.target.value)}
                        maxLength={255}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteConfirmInput("")}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteDomain(domain)}
                        disabled={
                          deletingDomainId === domain.id ||
                          deleteConfirmInput !== domain.name
                        }
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
              {refreshingDomains[domain.id]?.cooldown > 0 &&
                !areAllRecordsVerified(domain.records) && (
                  <div className="mt-2 rounded-md border border-yellow-300 bg-yellow-100 p-4 text-xs text-muted-foreground">
                    <p>
                      <b>Note:</b> It may take a few minutes or hours for the
                      domain to be fully verified.
                    </p>
                  </div>
                )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-4">
        <form onSubmit={handleAddDomain} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="domain" className="ml-1">
              Add New Domain
            </Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Input
                        id="domain"
                        placeholder="example.com"
                        value={newDomain}
                        onChange={(e) => {
                          setNewDomain(e.target.value);
                          setValidationError(null);
                        }}
                        className={validationError ? "border-red-500" : ""}
                        disabled={isAddingDomain || isMaxDomainsReached}
                        maxLength={255}
                      />
                    </div>
                  </TooltipTrigger>
                  {isMaxDomainsReached && (
                    <TooltipContent side="top">
                      <p>
                        You can only have a maximum of 5 domains per
                        organization.
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>

                {validationError && (
                  <p className="mt-1 text-xs text-red-500">{validationError}</p>
                )}
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      type="submit"
                      disabled={isAddingDomain || isMaxDomainsReached}
                    >
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
                  </span>
                </TooltipTrigger>
                {isMaxDomainsReached && (
                  <TooltipContent side="top">
                    <p>
                      You can only have a maximum of 5 domains per organization.
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
