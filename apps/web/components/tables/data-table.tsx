"use client";

import { cn } from "@church-space/ui/cn";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import { useSidebar } from "@church-space/ui/sidebar";
import { Skeleton } from "@church-space/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@church-space/ui/table";
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
  useReactTable,
} from "@tanstack/react-table";
import debounce from "lodash/debounce";
import { SearchIcon } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import ActionBar from "./action-bar";
declare module "@tanstack/react-table" {
  //allows us to define custom properties for our columns
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select";
    enumValues?: string[];
  }
}

// Define a type for filter configuration
export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  [key: string]: {
    type: "select" | "text" | "range";
    options?: FilterOption[];
    defaultValue?: string;
    label?: string;
  };
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  pageSize?: number;
  hasNextPage?: boolean;
  loadMore?: (params: {
    from: number;
    to: number;
  }) => Promise<{ data: TData[] }>;
  onLoadingStateChange?: (isLoading: boolean) => void;
  searchQuery?: string;
  onSearch?: (value: string) => void;
  filterConfig?: FilterConfig;
  onFilterChange?: {
    [key: string]: (value: any) => void;
  };
  initialFilters?: {
    [key: string]: string | undefined;
  };
  isLoading?: boolean;
  searchPlaceholderText?: string;
  nullState?: React.ReactNode;
}

export default function DataTable<TData>({
  columns,
  data: initialData,
  pageSize = 25,
  hasNextPage: initialHasNextPage,
  loadMore,
  onLoadingStateChange,
  searchQuery = "",
  onSearch,
  filterConfig,
  onFilterChange,
  initialFilters,
  isLoading: externalIsLoading,
  searchPlaceholderText = "Search...",
  nullState,
}: DataTableProps<TData>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState(searchQuery);
  const [data, setData] = useState<TData[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(initialHasNextPage);
  const [rowSelection, setRowSelection] = useState({});
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { state: sidebarState } = useSidebar();

  // Initialize column filters from initialFilters prop
  useEffect(() => {
    if (initialFilters) {
      const filters: ColumnFiltersState = [];

      Object.entries(initialFilters).forEach(([key, value]) => {
        if (value && value !== "all") {
          filters.push({ id: key, value });
        }
      });

      if (filters.length > 0) {
        setColumnFilters(filters);
      }
    }
  }, [initialFilters]);

  const debouncedSearchRef = useRef(
    debounce((value: string, callback?: (value: string) => void) => {
      callback?.(value);
    }, 300),
  );

  // Create a memoized search handler
  const handleSearch = useCallback(
    (value: string) => {
      debouncedSearchRef.current(value, onSearch);
    },
    [onSearch],
  );

  // Handle search input changes
  const handleSearchChange = useCallback(
    (value: string) => {
      setGlobalFilter(value);
      handleSearch(value);
    },
    [handleSearch],
  );

  // Update data when initialData changes
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Update loading state from external source
  useEffect(() => {
    if (externalIsLoading !== undefined) {
      setIsLoading(externalIsLoading);
    }
  }, [externalIsLoading]);

  useEffect(() => {
    setGlobalFilter(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setHasMorePages(initialHasNextPage);
  }, [initialHasNextPage]);

  // Clean up the debounced function on unmount
  useEffect(() => {
    const debouncedFn = debouncedSearchRef.current;
    return () => {
      debouncedFn.cancel();
    };
  }, []);

  const setupObserver = useCallback(() => {
    if (!containerRef.current || !loadMore || !hasMorePages) return;

    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const sentinel = containerRef.current.querySelector(".sentinel");
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading && hasMorePages) {
          const loadNextPage = async () => {
            setIsLoading(true);
            onLoadingStateChange?.(true);

            try {
              const from = data.length;
              const to = from + pageSize - 1;
              const result = await loadMore({ from, to });

              if (!result.data.length) {
                setHasMorePages(false);
              } else {
                setData((prevData) => [...prevData, ...result.data]);
              }
            } catch (error) {
              console.error("Error loading more data:", error);
              setHasMorePages(false);
            } finally {
              setIsLoading(false);
              onLoadingStateChange?.(false);
            }
          };

          void loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.5,
      },
    );

    observerRef.current.observe(sentinel);
  }, [
    data.length,
    hasMorePages,
    isLoading,
    loadMore,
    onLoadingStateChange,
    pageSize,
  ]);

  // Setup observer when component mounts or when dependencies change
  useEffect(() => {
    setupObserver();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupObserver]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      globalFilter: "",
      rowSelection,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    enableSorting: false,
    enableRowSelection: true,
  });

  const selectedRows = table.getSelectedRowModel().rows;

  return (
    <div className="relative space-y-6" style={{ minHeight: "200px" }}>
      {/* Search and Filters */}
      {onSearch && (
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {/* Global Search */}

          <div className="min-w-72 flex-1">
            <Label htmlFor="global-search">Search</Label>
            <div className="relative">
              <Input
                id="global-search"
                className="rounded-lg ps-9"
                value={globalFilter}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={searchPlaceholderText}
                type="text"
                maxLength={500}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
                <SearchIcon size={16} />
              </div>
            </div>
          </div>

          {/* Filters from filterConfig */}
          {filterConfig &&
            Object.entries(filterConfig).map(([key, config]) => {
              if (config.type === "select" && config.options) {
                // Find the current filter value
                const currentFilterValue = columnFilters.find(
                  (filter) => filter.id === key,
                )?.value as string;

                return (
                  <div key={key} className="w-auto min-w-36">
                    <Label htmlFor={`filter-${key}`}>
                      {config.label ??
                        key.charAt(0).toUpperCase() + key.slice(1)}
                    </Label>
                    <Select
                      value={currentFilterValue ?? config.defaultValue ?? "all"}
                      onValueChange={(value) => {
                        // Update the column filter
                        if (value === "all") {
                          setColumnFilters((prev) =>
                            prev.filter((filter) => filter.id !== key),
                          );
                        } else {
                          setColumnFilters((prev) => {
                            const existing = prev.find(
                              (filter) => filter.id === key,
                            );
                            if (existing) {
                              return prev.map((filter) =>
                                filter.id === key
                                  ? { ...filter, value }
                                  : filter,
                              );
                            }
                            return [...prev, { id: key, value }];
                          });
                        }

                        // Call the onFilterChange callback if provided
                        if (onFilterChange && onFilterChange[key]) {
                          onFilterChange[key](value);
                        }
                      }}
                    >
                      <SelectTrigger
                        id={`filter-${key}`}
                        className="rounded-lg"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {config.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }
              return null;
            })}

          {/* Column-based filters */}
          {table
            .getAllColumns()
            .filter(
              (column) =>
                column.columnDef.meta?.filterVariant === "select" &&
                !filterConfig?.[column.id],
            )
            .map((column) => (
              <div key={column.id} className="w-auto min-w-36">
                <Filter column={column} />
              </div>
            ))}
        </div>
      )}

      <div
        className={cn(
          "max-w-[92vw] overflow-auto",
          sidebarState === "expanded" && "md:max-w-[calc(100vw-17rem)]",
          sidebarState === "collapsed" && "md:max-w-[calc(100vw-3.5rem)]",
        )}
      >
        <div ref={containerRef} className="h-full min-h-[calc(50vh)]">
          <Table className="w-full border-separate border-spacing-0 [&_td]:border-border [&_tfoot_td]:border-t [&_th]:border-b [&_th]:border-border [&_tr:not(:last-child)_td]:border-b [&_tr]:border-none">
            <TableHeader className="backdrop-blur-xs sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-muted hover:bg-muted"
                >
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "relative h-10 select-none border-t",
                          index === 0 && "rounded-l-lg border-l pl-4",
                          index === headerGroup.headers.length - 1 &&
                            "rounded-r-lg border-r pr-2",
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading && data.length === 0 ? (
                // Show skeleton rows while loading
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={index} className="group/table-row h-20">
                    {Array.from({ length: columns.length }).map(
                      (_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-4 w-3/4" />
                        </TableCell>
                      ),
                    )}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                <>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="group/table-row h-20"
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
                  ))}
                  {isLoading &&
                    Array.from({ length: 3 }).map((_, index) => (
                      <TableRow
                        key={`loading-${index}`}
                        className="group/table-row h-20"
                      >
                        {Array.from({ length: columns.length }).map(
                          (_, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton className="h-4 w-3/4" />
                            </TableCell>
                          ),
                        )}
                      </TableRow>
                    ))}
                </>
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="pt-10 text-center hover:bg-transparent"
                  >
                    {nullState ? nullState : "No results."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* Sentinel element for intersection observer */}
          {hasMorePages && !isLoading && (
            <div
              className="sentinel h-20 w-full"
              data-testid="sentinel"
              style={{ visibility: "hidden" }}
            />
          )}
        </div>
      </div>

      {/* Action Bar */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center">
          <ActionBar onDeselectAll={() => setRowSelection({})} />
        </div>
      )}
    </div>
  );
}

function Filter({ column }: { column: Column<any, unknown> }) {
  const id = useId();
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};
  const columnHeader =
    typeof column.columnDef.header === "string" ? column.columnDef.header : "";

  if (filterVariant === "select") {
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
            maxLength={100}
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
            maxLength={100}
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
          maxLength={200}
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <SearchIcon size={16} />
        </div>
      </div>
    </div>
  );
}
