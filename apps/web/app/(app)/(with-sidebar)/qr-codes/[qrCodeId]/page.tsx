"use client";

import React from "react";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Separator } from "@church-space/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { useState, useEffect } from "react";
import { QRCode } from "react-qrcode-logo";
import { Button } from "@church-space/ui/button";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { Switch } from "@church-space/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@church-space/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CustomTooltip,
} from "@church-space/ui/chart";
import { Download, Plus, Trash2, Edit } from "lucide-react";
import { Upload } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
// import { getQRLinkQuery } from "@church-space/supabase/queries/all/get-qr-code";
// import { createClient } from "@church-space/supabase/client";
// import { useParams } from "next/navigation";
// import { useQuery } from "@tanstack/react-query";

// Types
type QRCodeData = {
  id: string;
  name: string;
  bgColor: string;
  qrColor: string;
  isRounded: boolean;
  isTransparent: boolean;
  logoImage: string | null;
  logoSize: number;
  clicks: ClickData[];
};

type ClickData = {
  timestamp: string;
  count: number;
};

type LinkData = {
  url: string;
  name: string;
  qrCodes: QRCodeData[];
};

type DateFilter = {
  year: number;
  month: number | null;
  day: number | null;
};

// Mock data for clicks
const generateMockClicks = (
  startDate: Date,
  endDate: Date,
  qrCodeCount: number,
): ClickData[][] => {
  const result: ClickData[][] = [];

  for (let i = 0; i < qrCodeCount; i++) {
    const clicks: ClickData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      for (let h = 0; h < 24; h += 4) {
        // Every 4 hours
        const date = new Date(currentDate);
        date.setHours(h, 0, 0, 0);

        // Create different patterns for different QR codes
        let count = 0;
        if (i === 0) {
          // First QR code has higher usage in mornings
          count = Math.floor(Math.random() * 8) + (h < 12 ? 5 : 2);
        } else if (i === 1) {
          // Second QR code has higher usage in evenings
          count = Math.floor(Math.random() * 7) + (h >= 12 ? 6 : 1);
        } else {
          // Other QR codes have more random patterns
          count = Math.floor(Math.random() * 10) + 1;
        }

        clicks.push({
          timestamp: date.toISOString(),
          count: count,
        });
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    result.push(clicks);
  }

  return result;
};

// Chart colors
const CHART_COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#8AC926",
  "#1982C4",
  "#6A4C93",
  "#F94144",
];

// Get available years for filter (current year and previous year)
const getAvailableYears = () => {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear - 1];
};

// Get available months (1-12)
const getAvailableMonths = () => {
  return Array.from({ length: 12 }, (_, i) => i + 1);
};

// Get available days for a specific month and year
const getAvailableDays = (year: number, month: number) => {
  // Get the last day of the month
  const lastDay = new Date(year, month, 0).getDate();
  return Array.from({ length: lastDay }, (_, i) => i + 1);
};

export default function Page() {
  const [linkData, setLinkData] = useState<LinkData>({
    url: "https://example.com",
    name: "My Website",
    qrCodes: [
      {
        id: uuidv4(),
        name: "Main QR Code",
        bgColor: "#FFFFFF",
        qrColor: "#000000",
        isRounded: false,
        isTransparent: false,
        logoImage: null,
        logoSize: 50,
        clicks: [],
      },
      {
        id: uuidv4(),
        name: "Flyer QR Code",
        bgColor: "#FFFFFF",
        qrColor: "#FF6384",
        isRounded: true,
        isTransparent: false,
        logoImage: null,
        logoSize: 50,
        clicks: [],
      },
      {
        id: uuidv4(),
        name: "Business Card",
        bgColor: "#FFFFFF",
        qrColor: "#36A2EB",
        isRounded: false,
        isTransparent: false,
        logoImage: null,
        logoSize: 50,
        clicks: [],
      },
    ],
  });

  const currentYear = new Date().getFullYear();
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    year: currentYear,
    month: null,
    day: null,
  });

  const [selectedQRCodeIndex, setSelectedQRCodeIndex] = useState(0);
  const [editingQRCode, setEditingQRCode] = useState<QRCodeData | null>(null);
  const [isAddingQRCode, setIsAddingQRCode] = useState(false);
  const [newQRCodeName, setNewQRCodeName] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);

  // Add a new state to track if we're in edit mode for the link information
  const [isEditingLink, setIsEditingLink] = useState(false);
  // Add states to temporarily store edits before saving
  const [editedLinkName, setEditedLinkName] = useState(linkData.name);
  const [editedLinkUrl, setEditedLinkUrl] = useState(linkData.url);

  // Generate mock data for chart based on date filters
  useEffect(() => {
    let startDate: Date;
    let endDate: Date;

    if (dateFilter.day !== null && dateFilter.month !== null) {
      // Day view - show hours in a single day
      startDate = new Date(
        dateFilter.year,
        dateFilter.month - 1,
        dateFilter.day,
      );
      endDate = new Date(dateFilter.year, dateFilter.month - 1, dateFilter.day);
    } else if (dateFilter.month !== null) {
      // Month view - show days in a month
      startDate = new Date(dateFilter.year, dateFilter.month - 1, 1);
      endDate = new Date(dateFilter.year, dateFilter.month, 0); // Last day of month
    } else {
      // Year view - show months in a year
      startDate = new Date(dateFilter.year, 0, 1);
      endDate = new Date(dateFilter.year, 11, 31);
    }

    const mockClicksData = generateMockClicks(
      startDate,
      endDate,
      linkData.qrCodes.length,
    );

    // Update each QR code with mock clicks
    const updatedQRCodes = linkData.qrCodes.map((qrCode, index) => ({
      ...qrCode,
      clicks: mockClicksData[index] || [],
    }));

    setLinkData((prev) => ({
      ...prev,
      qrCodes: updatedQRCodes,
    }));

    // Process data for chart
    processChartData(updatedQRCodes, dateFilter);
  }, [dateFilter, linkData.qrCodes.length]);

  const processChartData = (qrCodes: QRCodeData[], filter: DateFilter) => {
    const data: any[] = [];

    if (filter.day !== null && filter.month !== null) {
      // Day view - show hours
      for (let hour = 0; hour < 24; hour++) {
        const hourLabel = `${hour}:00`;
        const date = new Date(filter.year, filter.month - 1, filter.day, hour);
        const entry: any = {
          name: hourLabel,
          hour,
          day: filter.day,
          month: filter.month,
          year: filter.year,
          date,
        };

        qrCodes.forEach((qrCode) => {
          const hourClicks = qrCode.clicks.filter((click) => {
            const clickDate = new Date(click.timestamp);
            return clickDate.getHours() === hour;
          });

          entry[qrCode.name] = hourClicks.reduce(
            (sum, click) => sum + click.count,
            0,
          );
        });

        data.push(entry);
      }
    } else if (filter.month !== null) {
      // Month view - show days
      const daysInMonth = getAvailableDays(filter.year, filter.month);

      for (const day of daysInMonth) {
        const date = new Date(filter.year, filter.month - 1, day);
        const dayLabel = `${day}`;

        const entry: any = {
          name: dayLabel,
          day,
          month: filter.month,
          year: filter.year,
          date,
        };

        qrCodes.forEach((qrCode) => {
          const dayClicks = qrCode.clicks.filter((click) => {
            const clickDate = new Date(click.timestamp);
            return clickDate.getDate() === day;
          });

          entry[qrCode.name] = dayClicks.reduce(
            (sum, click) => sum + click.count,
            0,
          );
        });

        data.push(entry);
      }
    } else {
      // Year view - show months
      for (let month = 0; month < 12; month++) {
        const date = new Date(filter.year, month, 1);
        const monthLabel = date.toLocaleDateString("en-US", { month: "short" });

        const entry: any = {
          name: monthLabel,
          month: month + 1,
          year: filter.year,
          date,
        };

        qrCodes.forEach((qrCode) => {
          const monthClicks = qrCode.clicks.filter((click) => {
            const clickDate = new Date(click.timestamp);
            return clickDate.getMonth() === month;
          });

          entry[qrCode.name] = monthClicks.reduce(
            (sum, click) => sum + click.count,
            0,
          );
        });

        data.push(entry);
      }
    }

    setChartData(data);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingQRCode) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditingQRCode({
          ...editingQRCode,
          logoImage: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQRCode = (index: number) => {
    const canvas = document.querySelectorAll("canvas")[index];
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${linkData.qrCodes[index].name.replace(/\s+/g, "-")}.png`;
    link.href = url;
    link.click();
  };

  const addNewQRCode = () => {
    if (!newQRCodeName.trim()) return;

    const newQRCode: QRCodeData = {
      id: uuidv4(),
      name: newQRCodeName,
      bgColor: "#FFFFFF",
      qrColor: "#000000",
      isRounded: false,
      isTransparent: false,
      logoImage: null,
      logoSize: 50,
      clicks: [],
    };

    setLinkData((prev) => ({
      ...prev,
      qrCodes: [...prev.qrCodes, newQRCode],
    }));

    setNewQRCodeName("");
    setIsAddingQRCode(false);
  };

  const deleteQRCode = (index: number) => {
    if (linkData.qrCodes.length <= 1) return; // Don't delete the last QR code

    const updatedQRCodes = [...linkData.qrCodes];
    updatedQRCodes.splice(index, 1);

    setLinkData((prev) => ({
      ...prev,
      qrCodes: updatedQRCodes,
    }));

    if (selectedQRCodeIndex >= updatedQRCodes.length) {
      setSelectedQRCodeIndex(updatedQRCodes.length - 1);
    }
  };

  const saveQRCodeChanges = () => {
    if (!editingQRCode) return;

    const updatedQRCodes = [...linkData.qrCodes];
    const index = updatedQRCodes.findIndex((qr) => qr.id === editingQRCode.id);

    if (index !== -1) {
      updatedQRCodes[index] = editingQRCode;

      setLinkData((prev) => ({
        ...prev,
        qrCodes: updatedQRCodes,
      }));
    }

    setEditingQRCode(null);
  };

  // Handle date filter changes
  const handleYearChange = (year: string) => {
    setDateFilter({
      year: Number.parseInt(year),
      month: dateFilter.month,
      day: dateFilter.month ? dateFilter.day : null,
    });
  };

  const handleMonthChange = (month: string | null) => {
    if (month === null) {
      setDateFilter({
        ...dateFilter,
        month: null,
        day: null,
      });
    } else {
      setDateFilter({
        ...dateFilter,
        month: Number.parseInt(month),
        day: null,
      });
    }
  };

  const handleDayChange = (day: string | null) => {
    setDateFilter({
      ...dateFilter,
      day: day === null ? null : Number.parseInt(day),
    });
  };

  // Add functions to handle editing link information
  const startEditingLink = () => {
    setEditedLinkName(linkData.name);
    setEditedLinkUrl(linkData.url);
    setIsEditingLink(true);
  };

  const saveEditedLink = () => {
    setLinkData((prev) => ({
      ...prev,
      name: editedLinkName,
      url: editedLinkUrl,
    }));
    setIsEditingLink(false);
  };

  const cancelEditingLink = () => {
    setIsEditingLink(false);
  };

  // Add a function to handle chart bar clicks
  const handleChartClick = (data: any) => {
    if (!data) return;

    // If we're in year view and a month is clicked
    if (dateFilter.month === null) {
      setDateFilter({
        year: dateFilter.year,
        month: data.month,
        day: null,
      });
    }
    // If we're in month view and a day is clicked
    else if (dateFilter.day === null && data.day) {
      setDateFilter({
        year: dateFilter.year,
        month: dateFilter.month,
        day: data.day,
      });
    }
    // If we're in day view, zoom out to month view
    else if (dateFilter.day !== null) {
      setDateFilter({
        year: dateFilter.year,
        month: dateFilter.month,
        day: null,
      });
    }
  };
  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/qr-codes">QR Codes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{linkData.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="mx-auto max-w-6xl flex-1 px-4 py-10">
        <div className="flex flex-col space-y-6">
          {/* Link Information Section */}
          <div className="border-b pb-4">
            {isEditingLink ? (
              // Edit mode
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-link-name" className="mb-2 block">
                    Link Name
                  </Label>
                  <Input
                    id="edit-link-name"
                    value={editedLinkName}
                    onChange={(e) => setEditedLinkName(e.target.value)}
                    placeholder="Enter a name for this link"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="edit-link-url" className="mb-2 block">
                    Destination URL
                  </Label>
                  <Input
                    id="edit-link-url"
                    value={editedLinkUrl}
                    onChange={(e) => setEditedLinkUrl(e.target.value)}
                    placeholder="Enter the destination URL"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" onClick={cancelEditingLink}>
                    Cancel
                  </Button>
                  <Button onClick={saveEditedLink}>Save</Button>
                </div>
              </div>
            ) : (
              // Display mode
              <div className="group cursor-pointer" onClick={startEditingLink}>
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold transition-colors group-hover:text-primary">
                    {linkData.name}
                  </h2>
                  <Edit className="ml-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-1 text-muted-foreground">{linkData.url}</p>
              </div>
            )}
          </div>

          {/* Analytics Section */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">Analytics</h3>
                {dateFilter.month !== null && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (dateFilter.day !== null) {
                        // If in day view, go back to month view
                        setDateFilter({
                          ...dateFilter,
                          day: null,
                        });
                      } else {
                        // If in month view, go back to year view
                        setDateFilter({
                          ...dateFilter,
                          month: null,
                        });
                      }
                    }}
                    className="h-8 px-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <Select
                    value={dateFilter.year.toString()}
                    onValueChange={handleYearChange}
                  >
                    <SelectTrigger id="year-filter" className="w-[100px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableYears().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={dateFilter.month?.toString() || ""}
                    onValueChange={(value) => handleMonthChange(value || null)}
                  >
                    <SelectTrigger id="month-filter" className="w-[120px]">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {getAvailableMonths().map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {new Date(2000, month - 1, 1).toLocaleDateString(
                            "en-US",
                            { month: "long" },
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {dateFilter.month !== null && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={dateFilter.day?.toString() || ""}
                      onValueChange={(value) => handleDayChange(value || null)}
                    >
                      <SelectTrigger id="day-filter" className="w-[100px]">
                        <SelectValue placeholder="All Days" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Days</SelectItem>
                        {getAvailableDays(
                          dateFilter.year,
                          dateFilter.month,
                        ).map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                  onClick={(data) =>
                    data &&
                    data.activePayload &&
                    handleChartClick(data.activePayload[0].payload)
                  }
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {linkData.qrCodes.map((qrCode, index) => (
                    <Bar
                      key={qrCode.id}
                      dataKey={qrCode.name}
                      stackId="a"
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      cursor="pointer"
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Click on a bar to zoom in.{" "}
                {dateFilter.day !== null && "Click again to zoom out."}
              </p>
            </div>
          </div>
        </div>
        <Separator className="my-12" />
        <div className="mb-4 mt-12 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your QR Codes</h2>
          <Button onClick={() => setIsAddingQRCode(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add QR Code
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {linkData.qrCodes.map((qrCode, index) => (
            <Card key={qrCode.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{qrCode.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center gap-2 pb-4 pt-2">
                <div
                  onClick={() => downloadQRCode(index)}
                  className="group relative mx-auto cursor-pointer transition-transform hover:scale-105"
                  style={{
                    padding: "8px",
                    borderRadius: qrCode.isRounded ? "12px" : "0",
                    backgroundColor: qrCode.isTransparent
                      ? "transparent"
                      : qrCode.bgColor,
                  }}
                >
                  <QRCode
                    value={`churchspace.co/qr/${qrCode.id}`}
                    size={100}
                    bgColor={
                      qrCode.isTransparent
                        ? "rgba(255, 255, 255, 0)"
                        : qrCode.bgColor
                    }
                    fgColor={qrCode.qrColor}
                    qrStyle="squares"
                    eyeRadius={qrCode.isRounded ? 10 : 0}
                    logoImage={qrCode.logoImage || undefined}
                    logoWidth={qrCode.logoSize}
                    logoHeight={qrCode.logoSize}
                    removeQrCodeBehindLogo={true}
                    ecLevel="Q"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                    <Download className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingQRCode({ ...qrCode })}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {linkData.qrCodes.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteQRCode(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dialog for adding a new QR code */}
        <Dialog open={isAddingQRCode} onOpenChange={setIsAddingQRCode}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New QR Code</DialogTitle>
              <DialogDescription>
                Create a new QR code for your link.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-qr-name">QR Code Name</Label>
                <Input
                  id="new-qr-name"
                  value={newQRCodeName}
                  onChange={(e) => setNewQRCodeName(e.target.value)}
                  placeholder="e.g., Flyer QR Code, Business Card"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingQRCode(false)}
                >
                  Cancel
                </Button>
                <Button onClick={addNewQRCode}>Create QR Code</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog for editing a QR code */}
        <Dialog
          open={!!editingQRCode}
          onOpenChange={(open) => !open && setEditingQRCode(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit QR Code</DialogTitle>
              <DialogDescription>
                Customize the appearance of your QR code.
              </DialogDescription>
            </DialogHeader>
            {editingQRCode && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-qr-name">QR Code Name</Label>
                  <Input
                    id="edit-qr-name"
                    value={editingQRCode.name}
                    onChange={(e) =>
                      setEditingQRCode({
                        ...editingQRCode,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter a name for this QR code"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-bg-color">Background Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 w-6 rounded border"
                        style={{ backgroundColor: editingQRCode.bgColor }}
                      />
                      <Input
                        id="edit-bg-color"
                        type="color"
                        value={editingQRCode.bgColor}
                        onChange={(e) =>
                          setEditingQRCode({
                            ...editingQRCode,
                            bgColor: e.target.value,
                          })
                        }
                        className="h-10 w-10 p-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-transparent-bg"
                      checked={editingQRCode.isTransparent}
                      onCheckedChange={(checked) =>
                        setEditingQRCode({
                          ...editingQRCode,
                          isTransparent: checked,
                        })
                      }
                    />
                    <Label htmlFor="edit-transparent-bg">
                      Transparent Background
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-qr-color">QR Code Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 w-6 rounded border"
                        style={{ backgroundColor: editingQRCode.qrColor }}
                      />
                      <Input
                        id="edit-qr-color"
                        type="color"
                        value={editingQRCode.qrColor}
                        onChange={(e) =>
                          setEditingQRCode({
                            ...editingQRCode,
                            qrColor: e.target.value,
                          })
                        }
                        className="h-10 w-10 p-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-rounded-corners"
                    checked={editingQRCode.isRounded}
                    onCheckedChange={(checked) =>
                      setEditingQRCode({ ...editingQRCode, isRounded: checked })
                    }
                  />
                  <Label htmlFor="edit-rounded-corners">Rounded Corners</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-logo-upload">Upload Logo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("edit-logo-upload")?.click()
                      }
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" /> Choose Logo
                    </Button>
                    {editingQRCode.logoImage && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setEditingQRCode({
                            ...editingQRCode,
                            logoImage: null,
                          })
                        }
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {editingQRCode.logoImage && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="edit-logo-size">Logo Size</Label>
                        <span className="text-sm text-muted-foreground">
                          {editingQRCode.logoSize}px
                        </span>
                      </div>
                      <Input
                        id="edit-logo-size"
                        type="range"
                        min={20}
                        max={80}
                        value={editingQRCode.logoSize}
                        onChange={(e) =>
                          setEditingQRCode({
                            ...editingQRCode,
                            logoSize: Number.parseInt(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <div
                    className="mx-auto"
                    style={{
                      padding: "8px",
                      borderRadius: editingQRCode.isRounded ? "12px" : "0",
                      backgroundColor: editingQRCode.isTransparent
                        ? "transparent"
                        : editingQRCode.bgColor,
                      width: "fit-content",
                    }}
                  >
                    <QRCode
                      value={`churchspace.co/qr/${editingQRCode.id}`}
                      size={180}
                      bgColor={
                        editingQRCode.isTransparent
                          ? "rgba(255, 255, 255, 0)"
                          : editingQRCode.bgColor
                      }
                      fgColor={editingQRCode.qrColor}
                      qrStyle="squares"
                      eyeRadius={editingQRCode.isRounded ? 10 : 0}
                      logoImage={editingQRCode.logoImage || undefined}
                      logoWidth={editingQRCode.logoSize}
                      logoHeight={editingQRCode.logoSize}
                      removeQrCodeBehindLogo={true}
                      ecLevel="Q"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingQRCode(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={saveQRCodeChanges}>Save Changes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
