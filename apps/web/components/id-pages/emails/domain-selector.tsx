"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@church-space/ui/select";
import { Button } from "@church-space/ui/button";
import {
  getVerifiedDomainsQuery,
  getVerifiedDomainQuery,
} from "@church-space/supabase/queries/all/get-domains";
import { createClient } from "@church-space/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface Domain {
  id: number;
  domain: string;
  created_at: string;
  dns_records: any;
  is_primary: boolean | null;
  organization_id: string;
  resend_domain_id: string | null;
}

export default function DomainSelector({
  organizationId,
  onChange,
  value,
  className,
  selectFirstOnLoad = true,
}: {
  organizationId: string;
  onChange: (value: string) => void;
  value: string;
  className?: string;
  selectFirstOnLoad?: boolean;
}) {
  const supabase = createClient();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const result = await getVerifiedDomainsQuery(supabase, organizationId);
        if (result.error) {
          throw result.error;
        }
        setDomains(result.data || []);
        if (
          selectFirstOnLoad &&
          !value &&
          result.data &&
          result.data.length > 0
        ) {
          onChange(result.data[0].id.toString());
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch domains"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDomains();
  }, [organizationId, supabase, value, onChange, selectFirstOnLoad]);

  useEffect(() => {
    const fetchSelectedDomain = async () => {
      if (value) {
        try {
          const result = await getVerifiedDomainQuery(
            supabase,
            parseInt(value),
          );
          if (result.error) {
            throw result.error;
          }
          if (result.data && result.data.length > 0) {
            setSelectedDomain(result.data[0]);
          }
        } catch (err) {
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to fetch selected domain"),
          );
        }
      } else {
        setSelectedDomain(null);
      }
    };

    fetchSelectedDomain();
  }, [value, supabase]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading) {
    return (
      <div className="flex h-9 w-full items-center justify-center gap-2 rounded-md border text-sm text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <Link href="/settings/domains">
        <Button variant="secondary" className={className}>
          Add a domain
        </Button>
      </Link>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        {selectedDomain ? selectedDomain.domain : "Select Domain"}
      </SelectTrigger>
      <SelectContent>
        {domains.map((domain: Domain) => (
          <SelectItem key={domain.id} value={domain.id.toString()}>
            {domain.domain}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
