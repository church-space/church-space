"use client";

import { deleteEmailCategoryAction } from "@/actions/delete-email-category";
import { updateEmailCategoryAction } from "@/actions/update-email-category";
import { Button } from "@church-space/ui/button";
import { cn } from "@church-space/ui/cn";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@church-space/ui/form";
import { Trash } from "@church-space/ui/icons";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { Textarea } from "@church-space/ui/textarea";
import { useToast } from "@church-space/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil } from "lucide-react";

// Define the validation schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

type FormValues = z.infer<typeof formSchema>;

// Define the type based on the SQL schema
export type EmailCategory = {
  id: number;
  created_at: string;
  name: string | null;
  organization_id: string | null;
  description: string | null;
  updated_at: string | null;
};

interface NameCellProps {
  name: string | null;
  description: string | null;
  organizationId: string | null;
  id: number;
}

const currentYear = new Date().getFullYear();

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const dateYear = date.getFullYear();
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
  };
  if (dateYear !== currentYear) {
    options.year = "numeric";
  }
  return date.toLocaleDateString("en-US", options);
};

const NameCell = ({ name, description, organizationId, id }: NameCellProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: name || "",
      description: description || "",
    },
  });

  const handleUpdateCategory = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const result = await updateEmailCategoryAction({
        emailCategoryId: id,
        name: values.name,
        description: values.description,
      });

      if (!result) return;

      if (result.data?.success) {
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
        // Invalidate the email categories query
        if (organizationId) {
          await queryClient.invalidateQueries({
            queryKey: ["email-categories", organizationId],
          });
        }
        // Close the modal
        setIsOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.data?.error || "Failed to update category",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    setIsLoading(true);
    try {
      const result = await deleteEmailCategoryAction({
        emailCategoryId: id,
      });

      if (!result) return;

      if (result.data?.success) {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        // Invalidate the email categories query
        if (organizationId) {
          await queryClient.invalidateQueries({
            queryKey: ["email-categories", organizationId],
          });
        }
        // Close both dialogs
        setIsOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.data?.error || "Failed to delete category",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ml-1 flex flex-shrink-0 items-center gap-1 text-base font-medium">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="group h-16 w-full items-center justify-start gap-3 truncate px-1.5 text-left text-base hover:bg-transparent hover:underline [&_svg]:size-3"
          >
            <span>{name || "Untitled"}</span>
            <Pencil className="size-6 text-muted-foreground opacity-0 group-hover:opacity-100" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdateCategory)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label>Name</Label>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          maxLength={60}
                          className="pe-16"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {field.value.length} / 60
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <Label>Description</Label>
                    <div className="relative">
                      <FormControl>
                        <Textarea
                          {...field}
                          maxLength={80}
                          rows={2}
                          className="pe-16"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <span className="absolute right-2 top-2 text-sm text-muted-foreground">
                        {field.value.length} / 80
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex w-full flex-row items-center justify-between gap-2 sm:justify-between">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      tabIndex={-1}
                      type="button"
                      disabled={isLoading}
                    >
                      <span className="hidden sm:inline">Delete</span>
                      <span className="inline sm:hidden">
                        <Trash />
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Category</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      Are you sure you want to delete this category?
                    </DialogDescription>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" type="button">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteCategory}
                        disabled={isLoading}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <div className="flex items-center gap-2">
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const columns: ColumnDef<EmailCategory>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <NameCell
          name={row.getValue("name")}
          description={row.getValue("description")}
          organizationId={row.original.organization_id}
          id={row.original.id}
        />
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return (
        <div
          className={cn(
            "ml-1 text-base font-medium",
            description ? "" : "text-sm text-muted-foreground",
          )}
        >
          <span>{description || "No description"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }) => {
      const updatedAt = row.getValue("updated_at") as string | null;
      if (!updatedAt) {
        return <span>-</span>;
      }

      return <span>{formatDate(updatedAt)}</span>;
    },
  },
];
