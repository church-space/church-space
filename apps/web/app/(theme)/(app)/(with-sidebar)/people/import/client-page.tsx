"use client";

import React, { useState, useRef } from "react";
import { Button } from "@church-space/ui/button";
import { Label } from "@church-space/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import { XIcon } from "@church-space/ui/icons";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Separator } from "@church-space/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { useUser } from "@/stores/use-user";
import { useCsvUpload } from "./use-csv-upload";
import { useToast } from "@church-space/ui/use-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function ImportPage() {
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedEmailColumn, setSelectedEmailColumn] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("unsubscribed");
  const [selectedFirstNameColumn, setSelectedFirstNameColumn] =
    useState<string>("");
  const [selectedLastNameColumn, setSelectedLastNameColumn] =
    useState<string>("");
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { organizationId } = useUser();
  const { uploadCsv } = useCsvUpload();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCurrentFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      if (lines.length > 0) {
        // Get headers from first line, clean them, and ensure uniqueness
        const headers = lines[0]
          .split(",")
          .map((header) => header.trim().replace(/['"]+/g, ""))
          .filter(
            (header, index, self) => header && self.indexOf(header) === index,
          ); // Remove empty headers and duplicates
        setCsvHeaders(headers);

        // Try to find and set email column based on priority
        const emailHeaders = [
          "email address",
          "Email Address",
          "email",
          "Email",
        ];
        for (const emailHeader of emailHeaders) {
          const foundHeader = headers.find(
            (header) => header.toLowerCase() === emailHeader.toLowerCase(),
          );
          if (foundHeader) {
            setSelectedEmailColumn(foundHeader);
            break;
          }
        }

        // Try to find and set first name column based on priority
        const firstNameHeaders = [
          "first name",
          "First Name",
          "firstname",
          "FirstName",
          "given name",
          "Given Name",
          "givenname",
          "GivenName",
        ];
        for (const firstNameHeader of firstNameHeaders) {
          const foundHeader = headers.find(
            (header) => header.toLowerCase() === firstNameHeader.toLowerCase(),
          );
          if (foundHeader) {
            setSelectedFirstNameColumn(foundHeader);
            break;
          }
        }

        // Try to find and set last name column based on priority
        const lastNameHeaders = [
          "last name",
          "Last Name",
          "lastname",
          "LastName",
          "surname",
          "Surname",
          "family name",
          "Family Name",
          "familyname",
          "FamilyName",
        ];
        for (const lastNameHeader of lastNameHeaders) {
          const foundHeader = headers.find(
            (header) => header.toLowerCase() === lastNameHeader.toLowerCase(),
          );
          if (foundHeader) {
            setSelectedLastNameColumn(foundHeader);
            break;
          }
        }
      }
    };
    reader.readAsText(file);
  };

  const handleRemoveFile = () => {
    setCurrentFile(null);
    setCsvHeaders([]);
    setSelectedEmailColumn("");
    setSelectedAction("");
    setSelectedFirstNameColumn("");
    setSelectedLastNameColumn("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setCurrentFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const lines = text.split("\n");
          if (lines.length > 0) {
            // Get headers from first line, clean them, and ensure uniqueness
            const headers = lines[0]
              .split(",")
              .map((header) => header.trim().replace(/['"]+/g, ""))
              .filter(
                (header, index, self) =>
                  header && self.indexOf(header) === index,
              ); // Remove empty headers and duplicates
            setCsvHeaders(headers);

            // Try to find and set email column based on priority
            const emailHeaders = [
              "email address",
              "Email Address",
              "email",
              "Email",
            ];
            for (const emailHeader of emailHeaders) {
              const foundHeader = headers.find(
                (header) => header.toLowerCase() === emailHeader.toLowerCase(),
              );
              if (foundHeader) {
                setSelectedEmailColumn(foundHeader);
                break;
              }
            }

            // Try to find and set first name column based on priority
            const firstNameHeaders = [
              "first name",
              "First Name",
              "firstname",
              "FirstName",
              "given name",
              "Given Name",
              "givenname",
              "GivenName",
            ];
            for (const firstNameHeader of firstNameHeaders) {
              const foundHeader = headers.find(
                (header) =>
                  header.toLowerCase() === firstNameHeader.toLowerCase(),
              );
              if (foundHeader) {
                setSelectedFirstNameColumn(foundHeader);
                break;
              }
            }

            // Try to find and set last name column based on priority
            const lastNameHeaders = [
              "last name",
              "Last Name",
              "lastname",
              "LastName",
              "surname",
              "Surname",
              "family name",
              "Family Name",
              "familyname",
              "FamilyName",
            ];
            for (const lastNameHeader of lastNameHeaders) {
              const foundHeader = headers.find(
                (header) =>
                  header.toLowerCase() === lastNameHeader.toLowerCase(),
              );
              if (foundHeader) {
                setSelectedLastNameColumn(foundHeader);
                break;
              }
            }
          }
        };
        reader.readAsText(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file only.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (
      !currentFile ||
      !organizationId ||
      !selectedEmailColumn ||
      !selectedAction
    ) {
      console.error("Missing required information for import.");
      toast({
        title: "Missing Information",
        description:
          "Please ensure a file is uploaded and selections are made.",
        variant: "destructive",
      });
      return;
    }

    if (
      selectedAction === "subscribed" &&
      (!selectedFirstNameColumn || !selectedLastNameColumn)
    ) {
      toast({
        title: "Missing Information",
        description:
          "Please select both first name and last name columns for subscriber import.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Upload CSV and get signed URL
      const signedUrl = await uploadCsv(currentFile, organizationId);

      // 2. Call the appropriate API endpoint based on the action
      const endpoint =
        selectedAction === "subscribed"
          ? "/api/organization/import-subscribes"
          : "/api/organization/import-unsubscribes";

      const payload =
        selectedAction === "subscribed"
          ? {
              organizationId,
              fileUrl: signedUrl,
              emailColumn: selectedEmailColumn,
              firstNameColumn: selectedFirstNameColumn,
              lastNameColumn: selectedLastNameColumn,
            }
          : {
              organizationId,
              fileUrl: signedUrl,
              emailColumn: selectedEmailColumn,
              status: selectedAction,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API request failed: ${response.status} ${response.statusText} - ${errorData?.error || "Unknown error"}`,
        );
      }

      toast({
        title: "Import Started",
        description: `Your ${selectedAction === "subscribed" ? "subscriber" : "unsubscribe"} import job has started successfully.`,
      });
      handleRemoveFile(); // Reset form on success
    } catch (error: any) {
      console.error("Error during import process:", error);
      toast({
        title: "Import Failed",
        description:
          error.message || "An unexpected error occurred during import.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <Link href="/people" className="hidden md:block">
                <BreadcrumbItem>
                  <BreadcrumbPage>People</BreadcrumbPage>
                </BreadcrumbItem>
              </Link>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Import Unsubscribed</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="p-6">
        <div className="mx-auto w-full max-w-2xl p-6">
          <h1 className="mb-6 text-2xl font-bold">
            Import Unsubscribed Contacts
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Importing unsubscribed contacts will help you not email people who
            have asked to not receive your emails. This helps make sure emails
            you send land in people&apos;s inboxes instead of their spam
            folders.
          </p>

          <div className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="csv-upload">Upload CSV File</Label>
              {!currentFile ? (
                <div
                  className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center hover:border-primary"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="csv-upload"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p>Click to upload or drag and drop</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    CSV files only
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <span className="truncate">{currentFile.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="ml-2 h-8 w-8"
                  >
                    <XIcon />
                  </Button>
                </div>
              )}
            </div>

            {csvHeaders.length > 0 && (
              <>
                {/* Email Column Selection */}
                <div className="space-y-2">
                  <Label>Select Email Address Column</Label>
                  <Select
                    value={selectedEmailColumn}
                    onValueChange={setSelectedEmailColumn}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {csvHeaders.map((header, index) => (
                        <SelectItem key={`${header}-${index}`} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Selection */}
                <div className="space-y-2">
                  <Label>Mark Contacts As</Label>
                  <Select
                    value={selectedAction}
                    onValueChange={setSelectedAction}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                      <SelectItem value="cleaned">Cleaned</SelectItem>
                      <SelectItem value="subscribed">Subscribed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedAction === "subscribed" && (
                  <>
                    {/* First Name Column Selection */}
                    <div className="space-y-2">
                      <Label>Select First Name Column</Label>
                      <Select
                        value={selectedFirstNameColumn}
                        onValueChange={setSelectedFirstNameColumn}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {csvHeaders.map((header, index) => (
                            <SelectItem
                              key={`${header}-${index}`}
                              value={header}
                            >
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Last Name Column Selection */}
                    <div className="space-y-2">
                      <Label>Select Last Name Column</Label>
                      <Select
                        value={selectedLastNameColumn}
                        onValueChange={setSelectedLastNameColumn}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {csvHeaders.map((header, index) => (
                            <SelectItem
                              key={`${header}-${index}`}
                              value={header}
                            >
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !selectedEmailColumn ||
                    !selectedAction ||
                    isLoading ||
                    (selectedAction === "subscribed" &&
                      (!selectedFirstNameColumn || !selectedLastNameColumn))
                  }
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {selectedAction === "subscribed"
                    ? "Import Subscribers"
                    : `Mark as ${
                        selectedAction === "unsubscribed"
                          ? "Unsubscribed"
                          : "Cleaned"
                      }`}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
