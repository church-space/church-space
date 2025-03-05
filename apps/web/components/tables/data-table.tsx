"use client";

import { cn } from "@church-space/ui/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@church-space/ui/table";
import { useId, useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  RowData,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from "lucide-react";
import debounce from "lodash/debounce";

declare module "@tanstack/react-table" {
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select";
    enumValues?: string[];
  }
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  initialSorting?: SortingState;
  pageSize?: number;
  hasNextPage?: boolean;
  loadMore?: (params: {
    from: number;
    to: number;
  }) => Promise<{ data: TData[] }>;
  onLoadingStateChange?: (isLoading: boolean) => void;
  searchQuery?: string;
  onSearch?: (value: string) => void;
}

export default function DataTable<TData>({
  columns,
  data: initialData,
  initialSorting = [],
  pageSize = 25,
  hasNextPage: initialHasNextPage,
  loadMore,
  onLoadingStateChange,
  searchQuery = "",
  onSearch,
}: DataTableProps<TData>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState(searchQuery);
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [data, setData] = useState<TData[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(initialHasNextPage);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create a memoized debounced search handler
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearch?.(value);
    }, 300),
    [onSearch],
  );

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    setGlobalFilter(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setHasMorePages(initialHasNextPage);
  }, [initialHasNextPage]);

  // Handle search input changes
  const handleSearchChange = useCallback(
    (value: string) => {
      setGlobalFilter(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  // Clean up the debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleScroll = useCallback(async () => {
    if (!containerRef.current || !loadMore || !hasMorePages || isLoading)
      return;

    const sentinel = containerRef.current.querySelector(".sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsLoading(true);
          onLoadingStateChange?.(true);

          try {
            const from = data.length;
            const to = from + pageSize - 1;
            const result = await loadMore({ from, to });

            // If no more data is returned, we've reached the end
            if (!result.data.length) {
              setHasMorePages(false);
            } else {
              setData((prevData) => [...prevData, ...result.data]);
            }
          } catch (error) {
            console.error("Error loading more data:", error);
            setHasMorePages(false); // Also set hasMorePages to false on error
          } finally {
            setIsLoading(false);
            onLoadingStateChange?.(false);
          }
        }
      },
      {
        root: containerRef.current,
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    data.length,
    hasMorePages,
    isLoading,
    loadMore,
    onLoadingStateChange,
    pageSize,
  ]);

  useEffect(() => {
    handleScroll();
  }, [handleScroll]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter: "",
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Global Search */}
        <div className="min-w-72 flex-1">
          <Label htmlFor="global-search">Search</Label>
          <div className="relative">
            <Input
              id="global-search"
              className="ps-9"
              value={globalFilter}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name or email..."
              type="text"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
              <SearchIcon size={16} />
            </div>
          </div>
        </div>

        {/* Email Status Filter */}
        {table
          .getAllColumns()
          .filter((column) => column.columnDef.meta?.filterVariant === "select")
          .map((column) => (
            <div key={column.id} className="w-auto min-w-36">
              <Filter column={column} />
            </div>
          ))}
      </div>

      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        <Table className="border-separate border-spacing-0 [&_td]:border-border [&_tfoot_td]:border-t [&_th]:border-b [&_th]:border-border [&_tr:not(:last-child)_td]:border-b [&_tr]:border-none">
          <TableHeader className="backdrop-blur-xs sticky top-0 z-10 bg-background/90">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="relative h-10 select-none border-t"
                      aria-sort={
                        header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                      }
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              "flex h-full cursor-pointer select-none items-center justify-between gap-2",
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (
                              header.column.getCanSort() &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: (
                              <ChevronUpIcon
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <ChevronDownIcon
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? (
                            <span className="size-4" aria-hidden="true" />
                          )}
                        </div>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {isLoading && (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Loading more...
          </div>
        )}
        {/* Sentinel element for intersection observer */}
        {hasMorePages && !isLoading && (
          <div className="sentinel h-4" data-testid="sentinel" />
        )}
      </div>
    </div>
  );
}

function Filter({ column }: { column: Column<any, unknown> }) {
  const id = useId();
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};
  const columnHeader =
    typeof column.columnDef.header === "string" ? column.columnDef.header : "";

  if (filterVariant === "select" && columnHeader === "Email Status") {
    return (
      <div className="*:not-first:mt-2">
        <Label htmlFor={`${id}-select`}>{columnHeader}</Label>
        <Select
          value={columnFilterValue?.toString() ?? "all"}
          onValueChange={(value) => {
            column.setFilterValue(value === "all" ? undefined : value);
          }}
        >
          <SelectTrigger id={`${id}-select`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {column.columnDef.meta?.enumValues?.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "partially subscribed"
                  ? "Partially Subscribed"
                  : value === "pco_blocked"
                    ? "PCO Blocked"
                    : value.charAt(0).toUpperCase() + value.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (filterVariant === "range") {
    return (
      <div className="*:not-first:mt-2">
        <Label>{columnHeader}</Label>
        <div className="flex">
          <Input
            id={`${id}-range-1`}
            className="flex-1 rounded-e-none [-moz-appearance:_textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
            value={(columnFilterValue as [number, number])?.[0] ?? ""}
            onChange={(e) =>
              column.setFilterValue((old: [number, number]) => [
                e.target.value ? Number(e.target.value) : undefined,
                old?.[1],
              ])
            }
            placeholder="Min"
            type="number"
            aria-label={`${columnHeader} min`}
          />
          <Input
            id={`${id}-range-2`}
            className="-ms-px flex-1 rounded-s-none [-moz-appearance:_textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
            value={(columnFilterValue as [number, number])?.[1] ?? ""}
            onChange={(e) =>
              column.setFilterValue((old: [number, number]) => [
                old?.[0],
                e.target.value ? Number(e.target.value) : undefined,
              ])
            }
            placeholder="Max"
            type="number"
            aria-label={`${columnHeader} max`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={`${id}-input`}>{columnHeader}</Label>
      <div className="relative">
        <Input
          id={`${id}-input`}
          className="peer ps-9"
          value={(columnFilterValue ?? "") as string}
          onChange={(e) => column.setFilterValue(e.target.value)}
          placeholder={`Search ${columnHeader.toLowerCase()}`}
          type="text"
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <SearchIcon size={16} />
        </div>
      </div>
    </div>
  );
}
