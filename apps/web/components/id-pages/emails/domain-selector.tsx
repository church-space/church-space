"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@church-space/ui/select";
import {
  getDomainsQuery,
  getDomainQuery,
} from "@church-space/supabase/queries/all/get-domains";
import { createClient } from "@church-space/supabase/client";
import { useEffect, useState } from "react";

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
}: {
  organizationId: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const supabase = createClient();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const result = await getDomainsQuery(supabase, organizationId);
        if (result.error) {
          throw result.error;
        }
        setDomains(result.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch domains"),
        );
      }
    };

    fetchDomains();
  }, [organizationId, supabase]);

  useEffect(() => {
    const fetchSelectedDomain = async () => {
      if (value) {
        try {
          const result = await getDomainQuery(supabase, parseInt(value));
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

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
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
