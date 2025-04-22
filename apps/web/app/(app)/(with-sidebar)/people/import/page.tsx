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

export default function ImportPage() {
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedEmailColumn, setSelectedEmailColumn] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("unsubscribed");
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

        console.log("CSV Headers:", headers);
      }
    };
    reader.readAsText(file);
  };

  const handleRemoveFile = () => {
    setCurrentFile(null);
    setCsvHeaders([]);
    setSelectedEmailColumn("");
    setSelectedAction("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    console.log({
      emailColumn: selectedEmailColumn,
      action: selectedAction,
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Import Unsubscribed Contacts</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Importing unsubscribed contacts will help you not email people who have
        asked to not receive your emails. This helps make sure emails you send
        land in people's inboxes instead of their spam folders.
      </p>

      <div className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="csv-upload">Upload CSV File</Label>
          {!currentFile ? (
            <div
              className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center hover:border-primary"
              onClick={() => fileInputRef.current?.click()}
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
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                  <SelectItem value="cleaned">Cleaned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedEmailColumn || !selectedAction}
              className="w-full"
            >
              Mark as{" "}
              {selectedAction === "unsubscribed" ? "Unsubscribed" : "Cleaned"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
