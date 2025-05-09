"use client";
import { Button } from "@church-space/ui/button";
import { Switch } from "@church-space/ui/switch";
import React, { useState } from "react";
import { LoaderIcon } from "@church-space/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";

type Category = {
  category_id: number;
  pco_name: string;
  description: string;
  is_unsubscribed: boolean;
};

export default function Manage({
  categories: initialCategories,
  unsubscribeAll,
  unsubscribeFromCategory,
  resubscribeToCategory,
  resubscribeAll,
}: {
  categories: Category[];
  unsubscribeAll: () => Promise<void>;
  unsubscribeFromCategory: (categoryId: number) => Promise<void>;
  resubscribeToCategory: (categoryId: number) => Promise<void>;
  resubscribeAll: () => Promise<void>;
}) {
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [isResubscribing, setIsResubscribing] = useState(false);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [togglingCategories, setTogglingCategories] = useState<Set<number>>(
    new Set(),
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUnsubscribe = async () => {
    try {
      setIsUnsubscribing(true);
      await unsubscribeAll();
      setUnsubscribed(true);
    } finally {
      setIsUnsubscribing(false);
    }
  };

  const handleResubscribeAll = async () => {
    try {
      setIsResubscribing(true);
      await resubscribeAll();
      setUnsubscribed(false);
    } finally {
      setIsResubscribing(false);
    }
  };

  const handleCategoryToggle = async (category: Category) => {
    try {
      setTogglingCategories((prev) => new Set([...prev, category.category_id]));

      if (category.is_unsubscribed) {
        await resubscribeToCategory(category.category_id);
      } else {
        await unsubscribeFromCategory(category.category_id);
      }

      // Update the local state
      setCategories((prevCategories) =>
        prevCategories.map((c) =>
          c.category_id === category.category_id
            ? { ...c, is_unsubscribed: !c.is_unsubscribed }
            : c,
        ),
      );

      // Show success message and set timer to hide it
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000); // Set timeout here
    } catch (error) {
      console.error("Failed to toggle category subscription:", error);
      // If there's an error, don't show success and maybe handle the error display
      setShowSuccess(false); // Ensure success is not shown on error
      return; // Exit early on error
    } finally {
      // Remove category from toggling set
      setTogglingCategories((prev) => {
        const newSet = new Set(prev);
        newSet.delete(category.category_id);
        return newSet;
      });
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-lg">
      <div className="mx-3 flex flex-col rounded-md border bg-card p-4">
        {unsubscribed ? (
          <>
            <h1 className="text-2xl font-bold">Unsubscribed</h1>
            <p className="text-sm text-muted-foreground">
              You have successfully unsubscribed from future emails. If this was
              an error, you can resubscribe to all emails by clicking the button
              below.
            </p>
            <Button
              className="mt-4 w-full"
              onClick={handleResubscribeAll}
              disabled={isResubscribing}
            >
              {isResubscribing ? (
                <span className="animate-spin">
                  <LoaderIcon />
                </span>
              ) : (
                "Resubscribe"
              )}
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">
              Manage your email preferences
            </h1>
            <div className="mt-6 space-y-4">
              {categories.map((category) => (
                <div
                  key={category.category_id}
                  className="flex w-full items-center justify-between border-b pb-4"
                >
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold">
                      {category.pco_name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  <Switch
                    checked={!category.is_unsubscribed}
                    disabled={togglingCategories.has(category.category_id)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 h-8">
              <div
                className={`flex items-center gap-2 text-sm text-green-500 transition-opacity duration-300 ease-in-out ${
                  showSuccess ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="h-4 w-4 animate-pulse rounded-full bg-green-500" />
                Saved
              </div>
            </div>

            <p className="mt-10 text-sm text-muted-foreground">
              If you would like to unsubscribe from all emails, please click the
              button below.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="mt-2 w-full">
                  Unsubscribe from All
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Unsubscribe from All</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Are you sure you want to unsubscribe from all emails?
                </DialogDescription>
                <Button
                  onClick={handleUnsubscribe}
                  disabled={isUnsubscribing}
                  className="mt-2 w-full"
                >
                  {isUnsubscribing ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4">
                        <LoaderIcon />
                      </div>
                      Unsubscribing...
                    </span>
                  ) : (
                    "Unsubscribe from All"
                  )}
                </Button>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
