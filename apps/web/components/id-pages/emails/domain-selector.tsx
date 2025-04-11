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
import { useQuery } from "@tanstack/react-query";
import React from "react";

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

  const { data: domains = [], error: domainsError } = useQuery<Domain[], Error>(
    {
      queryKey: ["domains", organizationId],
      queryFn: async () => {
        const result = await getDomainsQuery(supabase, organizationId);
        if (result.error) throw result.error;
        return result.data || [];
      },
    },
  );

  // Set initial value if needed
  React.useEffect(() => {
    if (!value && domains.length > 0) {
      onChange(domains[0].id.toString());
    }
  }, [domains, value, onChange]);

  const { data: selectedDomain, error: selectedDomainError } = useQuery<
    Domain | null,
    Error
  >({
    queryKey: ["domain", value],
    queryFn: async () => {
      if (!value) return null;
      const result = await getDomainQuery(supabase, parseInt(value));
      if (result.error) throw result.error;
      return result.data?.[0] || null;
    },
    enabled: !!value,
  });

  const error = domainsError || selectedDomainError;
  if (error) {
    return (
      <div>
        Error: {error instanceof Error ? error.message : "An error occurred"}
      </div>
    );
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
