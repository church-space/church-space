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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@church-space/ui/card";
import PcoRefresh from "./pco-refresh";

type ImportType = "subscribed" | "unsubscribed" | "cleaned";

interface ImportSection {
  file: File | null;
  headers: string[];
  emailColumn: string;
  firstNameColumn: string;
  lastNameColumn: string;
  tagsColumn: string;
}

export default function ImportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { organizationId } = useUser();
  const { uploadCsv } = useCsvUpload();

  const [importSections, setImportSections] = useState<
    Record<ImportType, ImportSection>
  >({
    subscribed: {
      file: null,
      headers: [],
      emailColumn: "",
      firstNameColumn: "",
      lastNameColumn: "",
      tagsColumn: "",
    },
    unsubscribed: {
      file: null,
      headers: [],
      emailColumn: "",
      firstNameColumn: "",
      lastNameColumn: "",
      tagsColumn: "",
    },
    cleaned: {
      file: null,
      headers: [],
      emailColumn: "",
      firstNameColumn: "",
      lastNameColumn: "",
      tagsColumn: "",
    },
  });

  const fileInputRefs = {
    subscribed: useRef<HTMLInputElement>(null),
    unsubscribed: useRef<HTMLInputElement>(null),
    cleaned: useRef<HTMLInputElement>(null),
  };

  const processFile = (file: File, type: ImportType) => {
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

        let emailColumn = "";
        let firstNameColumn = "";
        let lastNameColumn = "";
        let tagsColumn = "";

        // Try to find and set email column based on priority
        const emailHeaders = [
          "email address",
          "home email",
          "Home Email",
          "Email Address",
          "email",
          "Email",
        ];
        for (const emailHeader of emailHeaders) {
          const foundHeader = headers.find(
            (header) => header.toLowerCase() === emailHeader.toLowerCase(),
          );
          if (foundHeader) {
            emailColumn = foundHeader;
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
            firstNameColumn = foundHeader;
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
            lastNameColumn = foundHeader;
            break;
          }
        }

        const tagsHeaders = [
          "tags",
          "Tags",
          "tag",
          "Tag",
          "categories",
          "Categories",
          "category",
          "Category",
        ];
        for (const tagsHeader of tagsHeaders) {
          const foundHeader = headers.find(
            (header) => header.toLowerCase() === tagsHeader.toLowerCase(),
          );
          if (foundHeader) {
            tagsColumn = foundHeader;
            break;
          }
        }

        setImportSections((prev) => ({
          ...prev,
          [type]: {
            file,
            headers,
            emailColumn,
            firstNameColumn,
            lastNameColumn,
            tagsColumn,
          },
        }));
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: ImportType,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      processFile(file, type);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file only.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFile = (type: ImportType) => {
    setImportSections((prev) => ({
      ...prev,
      [type]: {
        file: null,
        headers: [],
        emailColumn: "",
        firstNameColumn: "",
        lastNameColumn: "",
        tagsColumn: "",
      },
    }));

    if (fileInputRefs[type].current) {
      fileInputRefs[type].current.value = "";
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: ImportType) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        processFile(file, type);
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
    // Check if at least one section has a file
    const hasAtLeastOneFile = Object.values(importSections).some(
      (section) => section.file !== null,
    );

    if (!hasAtLeastOneFile || !organizationId) {
      toast({
        title: "Missing Information",
        description: "Please upload at least one CSV file.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Process each import section that has a file
      const importPromises: Promise<void>[] = [];

      // Type-safe way to iterate through import types
      const importTypes: ImportType[] = [
        "subscribed",
        "unsubscribed",
        "cleaned",
      ];

      for (const type of importTypes) {
        const section = importSections[type];

        // Skip if no file uploaded for this section
        if (!section.file) continue;

        // Validate required fields
        if (!section.emailColumn) {
          toast({
            title: `Missing Information for ${type}`,
            description: "Please select an email column.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Additional validation for subscribed imports
        if (
          type === "subscribed" &&
          (!section.firstNameColumn || !section.lastNameColumn)
        ) {
          toast({
            title: "Missing Information for Subscribers",
            description:
              "Please select both first name and last name columns for subscriber import.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Create a promise for this import
        const importPromise = async () => {
          // 1. Upload CSV and get signed URL
          const signedUrl = await uploadCsv(section.file!, organizationId);

          // 2. Call the appropriate API endpoint based on the action
          const endpoint =
            type === "subscribed"
              ? "/api/organization/import-subscribes"
              : "/api/organization/import-unsubscribes";

          const payload =
            type === "subscribed"
              ? {
                  organizationId,
                  fileUrl: signedUrl,
                  emailColumn: section.emailColumn,
                  firstNameColumn: section.firstNameColumn,
                  lastNameColumn: section.lastNameColumn,
                  tagsColumn: section.tagsColumn,
                }
              : {
                  organizationId,
                  fileUrl: signedUrl,
                  emailColumn: section.emailColumn,
                  status: type,
                  tagsColumn: section.tagsColumn,
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
              `${type} import failed: ${response.status} ${response.statusText} - ${errorData?.error || "Unknown error"}`,
            );
          }

          // Reset this section on success
          handleRemoveFile(type);
        };

        importPromises.push(importPromise());
      }

      // Wait for all imports to complete
      await Promise.all(importPromises);

      toast({
        title: "Import Started",
        description: "Your import jobs have started successfully.",
      });
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

  const renderDropzone = (type: ImportType) => {
    return (
      <div
        className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center hover:border-primary"
        onClick={() => fileInputRefs[type].current?.click()}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, type)}
      >
        <input
          ref={fileInputRefs[type]}
          type="file"
          accept=".csv"
          onChange={(e) => handleFileUpload(e, type)}
          className="hidden"
        />
        <p>Click to upload or drag and drop</p>
        <p className="mt-2 text-sm text-muted-foreground">CSV files only</p>
      </div>
    );
  };

  const renderFileInfo = (type: ImportType) => {
    const section = importSections[type];

    if (!section.file) return null;

    return (
      <div className="flex items-center justify-between rounded-lg border p-4">
        <span className="truncate">{section.file.name}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleRemoveFile(type)}
          className="ml-2 h-8 w-8"
        >
          <XIcon />
        </Button>
      </div>
    );
  };

  const renderColumnSelectors = (type: ImportType) => {
    const section = importSections[type];

    if (!section.file || section.headers.length === 0) return null;

    return (
      <div className="mt-4 space-y-4">
        {/* Email Column Selection */}
        <div className="space-y-2">
          <Label>Select Email Address Column</Label>
          <Select
            value={section.emailColumn}
            onValueChange={(value) =>
              setImportSections((prev) => ({
                ...prev,
                [type]: {
                  ...prev[type],
                  emailColumn: value,
                },
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {section.headers.map((header, index) => (
                <SelectItem key={`${header}-${index}`} value={header}>
                  {header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* First and Last Name Column Selection (only for subscribed) */}
        {type === "subscribed" && (
          <>
            <div className="space-y-2">
              <Label>Select First Name Column</Label>
              <Select
                value={section.firstNameColumn}
                onValueChange={(value) =>
                  setImportSections((prev) => ({
                    ...prev,
                    [type]: {
                      ...prev[type],
                      firstNameColumn: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {section.headers.map((header, index) => (
                    <SelectItem key={`${header}-${index}`} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Last Name Column</Label>
              <Select
                value={section.lastNameColumn}
                onValueChange={(value) =>
                  setImportSections((prev) => ({
                    ...prev,
                    [type]: {
                      ...prev[type],
                      lastNameColumn: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {section.headers.map((header, index) => (
                    <SelectItem key={`${header}-${index}`} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Tags Column</Label>
              <Select
                value={section.tagsColumn}
                onValueChange={(value) =>
                  setImportSections((prev) => ({
                    ...prev,
                    [type]: {
                      ...prev[type],
                      tagsColumn: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {section.headers.map((header, index) => (
                    <SelectItem key={`${header}-${index}`} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <PcoRefresh />
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
                  <BreadcrumbPage>Import Contacts</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="p-6">
          <div className="mx-auto w-full max-w-4xl">
            <h1 className="mb-6 text-2xl font-bold">Import Contacts</h1>
            <p className="mb-6 text-pretty text-sm text-muted-foreground">
              Import your contacts from a former email provider. If a subscribed
              person does not exist in your Planning Center account, we&apos;ll
              add them for you. You&apos;ll be able to find these people in
              Planning Center using the custom tab &quot;Church Space&quot;. We
              do not import unsubscribed or cleaned contacts but highly
              recommend that you import them to Church Space.
            </p>

            <div className="grid grid-cols-1 gap-6">
              {/* Subscribed Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscribed</CardTitle>
                  <CardDescription className="text-pretty">
                    Due to a limit with Planning Center, expect the import to
                    take approximately 1 minute for every 100 contacts on your
                    CSV.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload CSV File</Label>
                    {!importSections.subscribed.file
                      ? renderDropzone("subscribed")
                      : renderFileInfo("subscribed")}
                  </div>
                  {renderColumnSelectors("subscribed")}
                </CardContent>
              </Card>

              {/* Unsubscribed Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Unsubscribed</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload CSV File</Label>
                    {!importSections.unsubscribed.file
                      ? renderDropzone("unsubscribed")
                      : renderFileInfo("unsubscribed")}
                  </div>
                  {renderColumnSelectors("unsubscribed")}
                </CardContent>
              </Card>

              {/* Cleaned Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Cleaned</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload CSV File</Label>
                    {!importSections.cleaned.file
                      ? renderDropzone("cleaned")
                      : renderFileInfo("cleaned")}
                  </div>
                  {renderColumnSelectors("cleaned")}
                </CardContent>
              </Card>
            </div>

            {/* Submit Button */}
            <div className="my-8 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={
                  isLoading ||
                  !Object.values(importSections).some(
                    (section) =>
                      section.file !== null &&
                      section.emailColumn !== "" &&
                      (section.file === importSections.subscribed.file
                        ? section.firstNameColumn !== "" &&
                          section.lastNameColumn !== ""
                        : true),
                  )
                }
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Import Contacts
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
