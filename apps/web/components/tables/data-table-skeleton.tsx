"use client";

import { cn } from "@church-space/ui/cn";
import { Skeleton } from "@church-space/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@church-space/ui/table";
import { useSidebar } from "@church-space/ui/sidebar";

interface DataTableSkeletonProps {
  title: string;
}

export default function DataTableSkeleton({ title }: DataTableSkeletonProps) {
  const { state: sidebarState } = useSidebar();

  return (
    <>
      <div className="mb-6 flex w-full items-center justify-between">
        <h1 className="flex items-center gap-1.5 text-3xl font-bold">
          <span className="font-normal text-muted-foreground">
            <Skeleton className="h-7 w-6" />
          </span>
          {title}
        </h1>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="relative space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Skeleton className="mt-2 h-10 flex-1" />
          <Skeleton className="mt-2 h-10 w-32" />
        </div>

        <div
          className={cn(
            "max-w-[92vw] overflow-auto",
            sidebarState === "expanded" && "md:max-w-[calc(100vw-17rem)]",
            sidebarState === "collapsed" && "md:max-w-[calc(100vw-3.5rem)]",
          )}
        >
          <div className="h-full min-h-[calc(100vh-255px)]">
            <Table className="w-full border-separate border-spacing-0 [&_td]:border-border [&_tfoot_td]:border-t [&_th]:border-b [&_th]:border-border [&_tr:not(:last-child)_td]:border-b [&_tr]:border-none">
              <TableHeader className="backdrop-blur-xs sticky top-0 z-10">
                <TableRow className="bg-muted">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <TableHead
                      key={index}
                      className={cn(
                        "relative h-10 select-none border-t",
                        index === 0 && "rounded-l-lg border-l pl-4",
                        index === 3 && "rounded-r-lg border-r pr-2",
                      )}
                    >
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex} className="group/table-row h-20">
                    {Array.from({ length: 4 }).map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton className="h-4 w-3/4" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
