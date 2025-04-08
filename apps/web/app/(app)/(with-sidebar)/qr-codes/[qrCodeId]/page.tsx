"use client";

import React from "react";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Separator } from "@church-space/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Download, Plus, Edit, Ellipsis } from "lucide-react";
import { Badge } from "@church-space/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import {
  getQRLinkQuery,
  getQRCodeClicksQuery,
  type QRCodeClick,
} from "@church-space/supabase/queries/all/get-qr-code";
import { createClient } from "@church-space/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createQRCode,
  deleteQRCode,
  updateQRCode,
  updateQRLink,
  deleteQRLink,
  updateQRLinkStatus,
} from "@church-space/supabase/mutations/qr-codes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@church-space/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@church-space/ui/dropdown-menu";
import {
  ChevronRight,
  ChevronLeft,
  Trash,
  DisableLink,
  LinkIcon,
} from "@church-space/ui/icons";
import { createRoot } from "react-dom/client";
import { useUser } from "@/stores/use-user";
import FileUpload from "@/components/dnd-builder/file-upload";
import { LoaderIcon } from "lucide-react";
import { z } from "zod";
import Link from "next/link";
import { Skeleton } from "@church-space/ui/skeleton";

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

// Update the linkSchema to be more strict with URLs
const linkSchema = z.object({
  name: z.string().min(1, "Title is required"),
  url: z
    .string()
    .min(1, "URL is required")
    .url("Please enter a valid URL")
    .refine((url) => {
      try {
        // URL must not contain spaces
        return !url.includes(" ");
      } catch {
        return false;
      }
    }, "URL cannot contain spaces or invalid characters"),
});

export default function Page() {
  const params = useParams();
  const supabase = createClient();
  const qrLinkId = Number(params.qrCodeId);
  const { organizationId } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isDeletingLink, setIsDeletingLink] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [dateFilter, setDateFilter] = useState<DateFilter>({
    year: currentYear,
    month: currentMonth,
    day: null,
  });

  const { data: qrLinkData, isLoading: isLoadingQRLink } = useQuery({
    queryKey: ["qr-link", qrLinkId],
    queryFn: async () => {
      const { data, error } = await getQRLinkQuery(supabase, qrLinkId);
      if (error) throw error;
      if (!data) throw new Error("QR link not found");
      return data;
    },
  });

  // Add a new query for QR code clicks with staleTime to prevent unnecessary refetches
  const {
    data: clicksData,
    isLoading: isLoadingClicks,
    refetch,
  } = useQuery({
    // Don't include dateFilter in queryKey since we want to keep all data in memory
    // and filter it client-side when zooming in/out
    queryKey: ["qr-clicks", qrLinkId],
    queryFn: async () => {
      if (!qrLinkData?.qr_codes) return null;
      const qrCodeIds = qrLinkData.qr_codes.map((qr) => qr.id);
      // Always fetch the entire year's data
      const yearFilter = {
        year: dateFilter.year,
        month: null,
        day: null,
      };
      const { data, error } = await getQRCodeClicksQuery(
        supabase,
        qrCodeIds,
        yearFilter,
      );
      if (error) throw error;
      return data;
    },
    enabled: !!qrLinkData?.qr_codes,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
  });

  const [linkData, setLinkData] = useState<LinkData>({
    url: "",
    name: "",
    qrCodes: [],
  });

  const [editingQRCode, setEditingQRCode] = useState<QRCodeData | null>(null);
  const [isAddingQRCode, setIsAddingQRCode] = useState(false);
  const [newQRCodeName, setNewQRCodeName] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [editedLinkName, setEditedLinkName] = useState(linkData.name);
  const [editedLinkUrl, setEditedLinkUrl] = useState(linkData.url);

  const [linkErrors, setLinkErrors] = useState<{
    name?: string;
    url?: string;
  }>({});

  // Map the database data to our component state
  useEffect(() => {
    if (qrLinkData) {
      const mappedQRCodes = qrLinkData.qr_codes.map((qrCode) => {
        const style = qrCode.style || {};
        return {
          id: qrCode.id,
          name: qrCode.title || "Untitled QR Code",
          bgColor: style.bgColor || "#FFFFFF",
          qrColor: style.qrColor || "#000000",
          isRounded: style.isRounded || false,
          isTransparent: style.isTransparent || false,
          logoImage: qrCode.linked_asset || null,
          logoSize: style.logoSize || 50,
          clicks: [], // Keep the mock clicks data for now
        };
      });

      setLinkData({
        url: qrLinkData.url || "",
        name: qrLinkData.name || "Untitled Link",
        qrCodes: mappedQRCodes,
      });
    }
  }, [qrLinkData]);

  // Update the useEffect that processes chart data
  useEffect(() => {
    if (!qrLinkData?.qr_codes || !clicksData) return;

    const qrCodes = qrLinkData.qr_codes;
    const data: any[] = [];

    if (dateFilter.month === null) {
      // Year view - show months
      for (let month = 0; month < 12; month++) {
        const date = new Date(dateFilter.year, month, 1);
        const monthLabel = date.toLocaleDateString("en-US", { month: "short" });

        const entry: any = {
          name: monthLabel,
          month: month + 1,
          year: dateFilter.year,
          date,
        };

        qrCodes.forEach((qrCode) => {
          const monthClicks = clicksData.filter((click: QRCodeClick) => {
            const clickDate = new Date(click.created_at);
            return (
              click.qr_code_id === qrCode.id &&
              clickDate.getMonth() === month &&
              clickDate.getFullYear() === dateFilter.year
            );
          });

          entry[qrCode.title || "Untitled QR Code"] = monthClicks.length;
        });

        data.push(entry);
      }
    } else {
      const month = dateFilter.month; // Store the non-null month value

      if (dateFilter.day !== null) {
        // Day view - show hours
        for (let hour = 0; hour < 24; hour++) {
          const hourLabel = `${hour}:00`;
          const date = new Date(
            dateFilter.year,
            month - 1,
            dateFilter.day,
            hour,
          );
          const entry: any = {
            name: hourLabel,
            hour,
            day: dateFilter.day,
            month,
            year: dateFilter.year,
            date,
          };

          qrCodes.forEach((qrCode) => {
            const hourClicks = clicksData.filter((click: QRCodeClick) => {
              const clickDate = new Date(click.created_at);
              return (
                click.qr_code_id === qrCode.id &&
                clickDate.getHours() === hour &&
                clickDate.getDate() === dateFilter.day &&
                clickDate.getMonth() === month - 1 &&
                clickDate.getFullYear() === dateFilter.year
              );
            });

            entry[qrCode.title || "Untitled QR Code"] = hourClicks.length;
          });

          data.push(entry);
        }
      } else {
        // Month view - show days
        const daysInMonth = getAvailableDays(dateFilter.year, month);

        for (const day of daysInMonth) {
          const date = new Date(dateFilter.year, month - 1, day);
          const dayLabel = `${day}`;

          const entry: any = {
            name: dayLabel,
            day,
            month,
            year: dateFilter.year,
            date,
          };

          qrCodes.forEach((qrCode) => {
            const dayClicks = clicksData.filter((click: QRCodeClick) => {
              const clickDate = new Date(click.created_at);
              return (
                click.qr_code_id === qrCode.id &&
                clickDate.getDate() === day &&
                clickDate.getMonth() === month - 1 &&
                clickDate.getFullYear() === dateFilter.year
              );
            });

            entry[qrCode.title || "Untitled QR Code"] = dayClicks.length;
          });

          data.push(entry);
        }
      }
    }

    setChartData(data);
  }, [dateFilter, qrLinkData?.qr_codes, clicksData]);

  const handleLogoUpload = async (path: string) => {
    if (editingQRCode) {
      setEditingQRCode({
        ...editingQRCode,
        logoImage: path,
      });
    }
  };

  const downloadQRCode = async (index: number) => {
    const qrCode = linkData.qrCodes[index];
    if (!qrCode) return;

    // Create a hidden container
    const downloadContainer = document.createElement("div");
    downloadContainer.style.position = "absolute";
    downloadContainer.style.left = "-9999px";
    document.body.appendChild(downloadContainer);

    try {
      // If there's a logo, preload it with CORS headers
      let logoImageUrl = undefined;
      if (qrCode.logoImage) {
        const logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/link-assets/${qrCode.logoImage}`;
        try {
          const response = await fetch(logoUrl);
          const blob = await response.blob();
          logoImageUrl = URL.createObjectURL(blob);
        } catch (error) {
          console.error("Error loading logo:", error);
          // If logo loading fails, we'll proceed without it
        }
      }

      // Add the high-res QR code directly to the DOM
      const qrCodeElement = (
        <QRCode
          value={`https://churchspace.co/qr/${qrCode.id}`}
          size={960}
          bgColor={
            qrCode.isTransparent ? "rgba(255, 255, 255, 0)" : qrCode.bgColor
          }
          fgColor={qrCode.qrColor}
          qrStyle={qrCode.isRounded ? "fluid" : "squares"}
          eyeRadius={qrCode.isRounded ? 64 : 0}
          logoImage={logoImageUrl}
          logoWidth={Math.round(qrCode.logoSize * (960 / 180))}
          logoHeight={Math.round(qrCode.logoSize * (960 / 180))}
          removeQrCodeBehindLogo={true}
          ecLevel="M"
        />
      );

      // Render the QR code
      downloadContainer.innerHTML = "";
      const root = createRoot(downloadContainer);
      root.render(qrCodeElement);

      // Wait a moment for the QR code to render
      await new Promise((resolve) => setTimeout(resolve, 100));

      const downloadCanvas = downloadContainer.querySelector("canvas");
      if (downloadCanvas) {
        const url = downloadCanvas.toDataURL("image/png", 1.0);
        const downloadLink = document.createElement("a");
        // Create filename using both link name and QR code name
        const linkName = linkData.name.replace(/\s+/g, "-").toLowerCase();
        const qrCodeName = qrCode.name.replace(/\s+/g, "-").toLowerCase();
        downloadLink.download = `${linkName}-${qrCodeName}.png`;
        downloadLink.href = url;
        downloadLink.click();
      }

      // Cleanup
      root.unmount();
      document.body.removeChild(downloadContainer);
      if (logoImageUrl) {
        URL.revokeObjectURL(logoImageUrl);
      }
    } catch (error) {
      console.error("Error downloading QR code:", error);
      // If the download fails, we'll try to download without the logo
      const qrCodeWithoutLogo = (
        <QRCode
          value={`https://churchspace.co/qr/${qrCode.id}`}
          size={120}
          bgColor={
            qrCode.isTransparent ? "rgba(255, 255, 255, 0)" : qrCode.bgColor
          }
          fgColor={qrCode.qrColor}
          qrStyle={qrCode.isRounded ? "fluid" : "squares"}
          eyeRadius={qrCode.isRounded ? 8 : 0}
          removeQrCodeBehindLogo={true}
          ecLevel="M"
        />
      );

      const root = createRoot(downloadContainer);
      root.render(qrCodeWithoutLogo);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const fallbackCanvas = downloadContainer.querySelector("canvas");
      if (fallbackCanvas) {
        const fallbackUrl = fallbackCanvas.toDataURL("image/png", 1.0);
        const fallbackLink = document.createElement("a");
        const linkName = linkData.name.replace(/\s+/g, "-").toLowerCase();
        const qrCodeName = qrCode.name.replace(/\s+/g, "-").toLowerCase();
        fallbackLink.download = `${linkName}-${qrCodeName}-no-logo.png`;
        fallbackLink.href = fallbackUrl;
        fallbackLink.click();
      }

      // Cleanup
      root.unmount();
      document.body.removeChild(downloadContainer);
    }
  };

  const addNewQRCode = async () => {
    if (!newQRCodeName.trim()) return;

    try {
      const { data, error } = await createQRCode(supabase, {
        title: newQRCodeName,
        qr_link_id: qrLinkId,
        style: {
          bgColor: "#FFFFFF",
          qrColor: "#000000",
          isRounded: false,
          isTransparent: false,
          logoSize: 50,
        },
      });

      if (error) throw error;
      if (!data || data.length === 0)
        throw new Error("No data returned from QR code creation");

      const createdQRCode = data[0];
      const style = createdQRCode.style as {
        bgColor?: string;
        qrColor?: string;
        isRounded?: boolean;
        isTransparent?: boolean;
        logoSize?: number;
      } | null;

      // Update local state with the new QR code
      const newQRCode: QRCodeData = {
        id: createdQRCode.id,
        name: createdQRCode.title || "Untitled QR Code",
        bgColor: style?.bgColor || "#FFFFFF",
        qrColor: style?.qrColor || "#000000",
        isRounded: style?.isRounded || false,
        isTransparent: style?.isTransparent || false,
        logoImage: createdQRCode.linked_asset || null,
        logoSize: style?.logoSize || 50,
        clicks: [],
      };

      setLinkData((prev) => ({
        ...prev,
        qrCodes: [...prev.qrCodes, newQRCode],
      }));

      setNewQRCodeName("");
      setIsAddingQRCode(false);
    } catch (error) {
      console.error("Error creating QR code:", error);
      // You might want to show an error toast here
    }
  };

  const handleDeleteQRCode = async (qrCodeId: string) => {
    if (linkData.qrCodes.length <= 1) return; // Don't delete the last QR code

    try {
      const { error } = await deleteQRCode(supabase, qrCodeId);
      if (error) throw error;

      const updatedQRCodes = linkData.qrCodes.filter(
        (qr) => qr.id !== qrCodeId,
      );
      setLinkData((prev) => ({
        ...prev,
        qrCodes: updatedQRCodes,
      }));

      if (editingQRCode?.id === qrCodeId) {
        setEditingQRCode(null);
      }
    } catch (error) {
      console.error("Error deleting QR code:", error);
      // You might want to show an error toast here
    }
  };

  const saveQRCodeChanges = async () => {
    if (!editingQRCode) return;

    try {
      const { error } = await updateQRCode(supabase, editingQRCode.id, {
        title: editingQRCode.name,
        linked_asset: editingQRCode.logoImage,
        style: {
          bgColor: editingQRCode.bgColor,
          qrColor: editingQRCode.qrColor,
          isRounded: editingQRCode.isRounded,
          isTransparent: editingQRCode.isTransparent,
          logoSize: editingQRCode.logoSize,
        },
      });

      if (error) throw error;

      // Update local state
      const updatedQRCodes = [...linkData.qrCodes];
      const index = updatedQRCodes.findIndex(
        (qr) => qr.id === editingQRCode.id,
      );

      if (index !== -1) {
        updatedQRCodes[index] = editingQRCode;

        setLinkData((prev) => ({
          ...prev,
          qrCodes: updatedQRCodes,
        }));
      }

      setEditingQRCode(null);
    } catch (error) {
      console.error("Error updating QR code:", error);
      // You might want to show an error toast here
    }
  };

  const saveEditedLink = async () => {
    try {
      // Reset errors
      setLinkErrors({});

      // Validate the input
      const result = linkSchema.safeParse({
        name: editedLinkName,
        url: editedLinkUrl,
      });

      if (!result.success) {
        const formattedErrors = result.error.format();
        setLinkErrors({
          name: formattedErrors.name?._errors[0],
          url: formattedErrors.url?._errors[0],
        });
        return;
      }

      const { error } = await updateQRLink(
        supabase,
        {
          id: qrLinkId,
          name: editedLinkName,
          url: editedLinkUrl,
        },
        qrLinkId,
      );

      if (error) {
        // Handle database-level URL validation error
        if (error.code === "23514") {
          setLinkErrors({
            ...linkErrors,
            url: "Please enter a valid URL without spaces or special characters",
          });
          return;
        }
        throw error;
      }

      // Update local state
      setLinkData((prev) => ({
        ...prev,
        name: editedLinkName,
        url: editedLinkUrl,
      }));

      // Invalidate and refetch the query
      await queryClient.invalidateQueries({ queryKey: ["qr-link", qrLinkId] });

      setIsEditingLink(false);
    } catch (error) {
      console.error("Error updating QR link:", error);
      // Show a generic error message
      setLinkErrors({
        ...linkErrors,
        url: "An error occurred while saving the URL",
      });
    }
  };

  // Handle date filter changes
  const handleYearChange = (year: string) => {
    setDateFilter({
      year: Number.parseInt(year),
      month: dateFilter.month,
      day: dateFilter.month ? dateFilter.day : null,
    });
  };

  // Add a function to check if a data point has any clicks
  const hasClicks = (data: any) => {
    if (!data) return false;
    return linkData.qrCodes.some((qrCode) => data[qrCode.name] > 0);
  };

  // Update the handleChartClick function
  const handleChartClick = async (data: any) => {
    if (!data || !hasClicks(data)) return;

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
    // If we're in day view, do nothing on click
  };

  // Update the handleBackClick function
  const handleBackClick = async () => {
    if (dateFilter.day !== null) {
      // If in day view, go back to month view - no need to refetch since we have the data
      setDateFilter({
        ...dateFilter,
        day: null,
      });
    } else if (dateFilter.month !== null) {
      // If in month view, go back to year view - need to refetch to get the whole year
      setDateFilter({
        ...dateFilter,
        month: null,
      });
      await refetch(); // Refetch only when going back to year view
    }
  };

  // Update the handleMonthChange function
  const handleMonthChange = (value: string | null) => {
    if (value === "all") {
      setDateFilter({
        year: dateFilter.year,
        month: null,
        day: null,
      });
    } else {
      setDateFilter({
        year: dateFilter.year,
        month: Number.parseInt(value!),
        day: null,
      });
    }
  };

  // Update the handleDayChange function
  const handleDayChange = (value: string | null) => {
    if (value === "all") {
      setDateFilter({
        year: dateFilter.year,
        month: dateFilter.month,
        day: null,
      });
    } else {
      setDateFilter({
        ...dateFilter,
        day: Number.parseInt(value!),
      });
    }
  };

  // Add functions to handle editing link information
  const startEditingLink = () => {
    setEditedLinkName(linkData.name);
    setEditedLinkUrl(linkData.url);
    setIsEditingLink(true);
  };

  const cancelEditingLink = () => {
    setIsEditingLink(false);
  };

  // Update the back button handler
  const handleDeleteLink = async () => {
    try {
      setIsDeleting(true);
      const { error } = await deleteQRLink(supabase, qrLinkId);
      if (error) throw error;
      router.push("/qr-codes");
    } catch (error) {
      console.error("Error deleting QR link:", error);
      // You might want to show an error toast here
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNavigateBack = () => {
    if (dateFilter.day !== null) {
      // In day view, go back one day
      const prevDay = new Date(
        dateFilter.year,
        dateFilter.month! - 1,
        dateFilter.day - 1,
      );
      setDateFilter({
        year: prevDay.getFullYear(),
        month: prevDay.getMonth() + 1,
        day: prevDay.getDate(),
      });
    } else if (dateFilter.month !== null) {
      // In month view, go back one month
      const prevMonth = new Date(dateFilter.year, dateFilter.month - 2, 1);
      setDateFilter({
        year: prevMonth.getFullYear(),
        month: prevMonth.getMonth() + 1,
        day: null,
      });
    } else {
      // In year view, go back one year
      setDateFilter({
        year: dateFilter.year - 1,
        month: null,
        day: null,
      });
    }
  };

  const handleNavigateForward = () => {
    const currentDate = new Date();

    if (dateFilter.day !== null) {
      // In day view, go forward one day
      const nextDay = new Date(
        dateFilter.year,
        dateFilter.month! - 1,
        dateFilter.day + 1,
      );
      // Don't go beyond current date
      if (nextDay <= currentDate) {
        setDateFilter({
          year: nextDay.getFullYear(),
          month: nextDay.getMonth() + 1,
          day: nextDay.getDate(),
        });
      }
    } else if (dateFilter.month !== null) {
      // In month view, go forward one month
      const nextMonth = new Date(dateFilter.year, dateFilter.month, 1);
      // Don't go beyond current date
      if (nextMonth <= currentDate) {
        setDateFilter({
          year: nextMonth.getFullYear(),
          month: nextMonth.getMonth() + 1,
          day: null,
        });
      }
    } else {
      // In year view, go forward one year
      const nextYear = dateFilter.year + 1;
      // Don't go beyond current year
      if (nextYear <= currentDate.getFullYear()) {
        setDateFilter({
          year: nextYear,
          month: null,
          day: null,
        });
      }
    }
  };

  const handleStatusToggle = async () => {
    if (!qrLinkData) return;

    try {
      setIsUpdatingStatus(true);
      const newStatus = qrLinkData.status === "active" ? "inactive" : "active";

      const { error } = await updateQRLinkStatus(supabase, qrLinkId, newStatus);
      if (error) throw error;

      // Update the cache with the new status
      queryClient.setQueryData(["qr-link", qrLinkId], {
        ...qrLinkData,
        status: newStatus,
      });

      // Invalidate the query to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: ["qr-link", qrLinkId] });
    } catch (error) {
      console.error("Error updating link status:", error);
    } finally {
      setIsUpdatingStatus(false);
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
                <Link prefetch={true} href="/qr-codes">
                  QR Codes
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {qrLinkData?.name || "Loading..."}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {isLoadingQRLink || isLoadingClicks ? (
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
          <div className="flex flex-col space-y-6">
            {/* Link Information Section */}
            <div className="flex w-full justify-between gap-4 border-b pb-4">
              <div className="group flex-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-muted-foreground transition-colors group-hover:text-primary">
                      Loading...
                    </h2>
                  </div>
                  <Edit className="ml-2 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-1 text-muted-foreground">Loading...</p>
              </div>
              <Button variant="ghost" size="icon">
                <Ellipsis className="h-4 w-4" />
              </Button>
            </div>

            {/* Analytics Section */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">Analytics</h3>

                  <Button variant="ghost" size="sm" className="h-8 px-2">
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
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="icon">
                    <ChevronLeft />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Select value={dateFilter.year.toString()}>
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
                    <Select value={dateFilter.month?.toString() || "all"}>
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

                  <div className="flex items-center gap-2">
                    <Select value={dateFilter.day?.toString() || "all"}>
                      <SelectTrigger id="day-filter" className="w-[100px]">
                        <SelectValue placeholder="All Days" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Days</SelectItem>
                        {getAvailableDays(
                          dateFilter.year,
                          dateFilter.month ?? 0,
                        ).map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="outline" size="icon">
                    <ChevronRight />
                  </Button>
                </div>
              </div>

              <div className="h-80 w-full">
                <Skeleton className="h-80 w-full" />
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
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add QR Code
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Skeleton className="h-52 w-full" />
            <Skeleton className="h-52 w-full" />
            <Skeleton className="h-52 w-full" />
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
          <div className="flex flex-col space-y-6">
            {/* Link Information Section */}
            <div className="flex w-full justify-between gap-4 border-b pb-4">
              {isEditingLink ? (
                // Edit mode
                <div className="flex-1 space-y-4">
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
                      className={linkErrors.name ? "border-destructive" : ""}
                    />
                    {linkErrors.name && (
                      <p className="mt-1 text-sm text-destructive">
                        {linkErrors.name}
                      </p>
                    )}
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
                      className={linkErrors.url ? "border-destructive" : ""}
                    />
                    {linkErrors.url && (
                      <p className="mt-1 text-sm text-destructive">
                        {linkErrors.url}
                      </p>
                    )}
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
                <div
                  className="group flex-1 cursor-pointer"
                  onClick={startEditingLink}
                >
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold transition-colors group-hover:text-primary">
                        {qrLinkData?.name || "Loading..."}
                      </h2>
                      {qrLinkData?.status === "inactive" && (
                        <Badge variant="outline">Disabled</Badge>
                      )}
                    </div>
                    <Edit className="ml-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {qrLinkData?.url || "Loading..."}
                  </p>
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Ellipsis className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleStatusToggle}
                    disabled={isUpdatingStatus}
                    className="cursor-pointer"
                  >
                    {qrLinkData?.status === "active" ? (
                      <>
                        <DisableLink /> Disable
                      </>
                    ) : (
                      <>
                        <LinkIcon /> Enable
                      </>
                    )}
                  </DropdownMenuItem>
                  <Dialog
                    open={isDeletingLink}
                    onOpenChange={setIsDeletingLink}
                  >
                    <DialogTrigger
                      onClick={(e) => {
                        e.preventDefault();
                        setIsDeletingLink(true);
                      }}
                      asChild
                    >
                      <DropdownMenuItem className="!hover:text-destructive cursor-pointer">
                        <Trash /> Delete
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Link</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this link? This action
                          cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsDeletingLink(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteLink}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <div className="flex items-center gap-2">
                              <LoaderIcon className="h-4 w-4 animate-spin" />
                              <span>Deleting...</span>
                            </div>
                          ) : (
                            "Delete"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </DropdownMenuContent>
              </DropdownMenu>
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
                      onClick={handleBackClick}
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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNavigateBack}
                  >
                    <ChevronLeft />
                  </Button>
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
                      value={dateFilter.month?.toString() || "all"}
                      onValueChange={handleMonthChange}
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
                        value={dateFilter.day?.toString() || "all"}
                        onValueChange={handleDayChange}
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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNavigateForward}
                  >
                    <ChevronRight />
                  </Button>
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
              <Card key={qrCode.id} className="overflow-hidden p-0">
                <Button
                  variant="ghost"
                  className="h-12 w-full items-center justify-between"
                  onClick={() => setEditingQRCode({ ...qrCode })}
                >
                  <CardHeader className="flex w-full flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-lg">{qrCode.name}</CardTitle>

                    <Edit className="h-4 w-4" />
                  </CardHeader>
                </Button>
                <CardContent className="flex flex-col justify-center gap-2 pb-4 pt-0">
                  <div
                    onClick={() => downloadQRCode(index)}
                    className="group relative mx-auto cursor-pointer transition-transform hover:scale-105"
                    style={{
                      backgroundColor: qrCode.isTransparent
                        ? "transparent"
                        : qrCode.bgColor,
                    }}
                  >
                    <QRCode
                      value={`https://churchspace.co/qr/${qrCode.id}`}
                      size={120}
                      bgColor={
                        qrCode.isTransparent
                          ? "rgba(255, 255, 255, 0)"
                          : qrCode.bgColor
                      }
                      fgColor={qrCode.qrColor}
                      qrStyle={qrCode.isRounded ? "fluid" : "squares"}
                      eyeRadius={qrCode.isRounded ? 8 : 0}
                      logoImage={
                        qrCode.logoImage
                          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/link-assets/${qrCode.logoImage}`
                          : undefined
                      }
                      logoWidth={Math.round(qrCode.logoSize * (120 / 180))}
                      logoHeight={Math.round(qrCode.logoSize * (120 / 180))}
                      removeQrCodeBehindLogo={true}
                      ecLevel="M"
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                      <Download className="h-8 w-8 text-white" />
                    </div>
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
                        setEditingQRCode({
                          ...editingQRCode,
                          isRounded: checked,
                        })
                      }
                    />
                    <Label htmlFor="edit-rounded-corners">
                      Rounded Corners
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-logo-upload">Upload Logo</Label>
                    <div className="flex items-center gap-2">
                      {organizationId && (
                        <>
                          <FileUpload
                            organizationId={organizationId}
                            onUploadComplete={handleLogoUpload}
                            type="image"
                            initialFilePath={editingQRCode.logoImage || ""}
                            onRemove={() => {
                              setEditingQRCode({
                                ...editingQRCode,
                                logoImage: null,
                              });
                            }}
                            bucket="link-assets"
                          />
                        </>
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
                          max={65}
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
                        backgroundColor: editingQRCode.isTransparent
                          ? "transparent"
                          : editingQRCode.bgColor,
                        width: "fit-content",
                      }}
                    >
                      <QRCode
                        value={`https://churchspace.co/qr/${editingQRCode.id}`}
                        size={120}
                        bgColor={
                          editingQRCode.isTransparent
                            ? "rgba(255, 255, 255, 0)"
                            : editingQRCode.bgColor
                        }
                        fgColor={editingQRCode.qrColor}
                        qrStyle={editingQRCode.isRounded ? "fluid" : "squares"}
                        eyeRadius={editingQRCode.isRounded ? 8 : 0}
                        logoImage={
                          editingQRCode.logoImage
                            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/link-assets/${editingQRCode.logoImage}`
                            : undefined
                        }
                        logoWidth={Math.round(
                          editingQRCode.logoSize * (120 / 180),
                        )}
                        logoHeight={Math.round(
                          editingQRCode.logoSize * (120 / 180),
                        )}
                        removeQrCodeBehindLogo={true}
                        ecLevel="M"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash /> Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete QR Code</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this QR code?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setEditingQRCode(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleDeleteQRCode(editingQRCode.id)}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingQRCode(null)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={saveQRCodeChanges}>Save</Button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}
