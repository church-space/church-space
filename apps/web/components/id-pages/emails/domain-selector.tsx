"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@church-space/ui/select";
import { getDomainsQuery } from "@church-space/supabase/queries/all/get-domains";
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

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>Select Domain</SelectTrigger>
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
