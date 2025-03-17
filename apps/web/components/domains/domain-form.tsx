"use client";

import type React from "react";

import { useState } from "react";
import { Copy, Check, Plus } from "lucide-react";
import { Button } from "@church-space/ui/button";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@church-space/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@church-space/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@church-space/ui/table";
import { toast } from "@church-space/ui/use-toast";

export default function DomainManagementForm() {
  const [domain, setDomain] = useState("");
  const [copiedRecord, setCopiedRecord] = useState<string | null>(null);

  // Sample DNS records - in a real app, these would be fetched from an API
  const mxRecords = [
    { priority: 10, value: "mx1.vercel-smtp.com", ttl: 3600 },
    { priority: 20, value: "mx2.vercel-smtp.com", ttl: 3600 },
  ];

  const txtRecords = [
    {
      name: "verification",
      value: "vercel-domain-verification=abc123def456",
      ttl: 3600,
    },
    { name: "spf", value: "v=spf1 include:_spf.vercel.com ~all", ttl: 3600 },
    {
      name: "dkim",
      value:
        "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCrLHiExVd55zd/IQ/J",
      ttl: 3600,
    },
    {
      name: "dmarc",
      value: "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com",
      ttl: 3600,
    },
  ];

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;

    toast({
      title: "Domain added",
      description: `${domain} has been added to your account.`,
    });

    // In a real app, you would submit this to your backend
    console.log("Domain added:", domain);
  };

  const copyToClipboard = (text: string, recordId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRecord(recordId);

    toast({
      title: "Copied to clipboard",
      description: "DNS record has been copied to your clipboard.",
    });

    setTimeout(() => {
      setCopiedRecord(null);
    }, 2000);
  };

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add Domain</CardTitle>
          <CardDescription>
            Add a domain to your account and manage its DNS records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddDomain} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain Name</Label>
              <div className="flex gap-2">
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Domain
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>DNS Records</CardTitle>
            <CardDescription>
              Click on any record to copy its value to your clipboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="mx" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mx">MX Records</TabsTrigger>
                <TabsTrigger value="txt">TXT Records</TabsTrigger>
              </TabsList>

              <TabsContent value="mx" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Priority</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>TTL</TableHead>
                      <TableHead className="w-[100px]">Copy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mxRecords.map((record, index) => (
                      <TableRow key={`mx-${index}`}>
                        <TableCell>{record.priority}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {record.value}
                        </TableCell>
                        <TableCell>{record.ttl}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(record.value, `mx-${index}`)
                            }
                          >
                            {copiedRecord === `mx-${index}` ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="txt" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>TTL</TableHead>
                      <TableHead className="w-[100px]">Copy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {txtRecords.map((record, index) => (
                      <TableRow key={`txt-${index}`}>
                        <TableCell>{record.name}</TableCell>
                        <TableCell className="max-w-[300px] truncate font-mono text-sm">
                          {record.value}
                        </TableCell>
                        <TableCell>{record.ttl}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(record.value, `txt-${index}`)
                            }
                          >
                            {copiedRecord === `txt-${index}` ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            DNS records can take up to 24 hours to fully propagate after being
            added. [^1]
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
