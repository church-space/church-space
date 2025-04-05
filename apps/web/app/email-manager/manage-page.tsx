"use client";
import { Button } from "@church-space/ui/button";
import { Switch } from "@church-space/ui/switch";
import React, { useEffect, useState } from "react";
import { LoaderIcon } from "@church-space/ui/icons";
import { getCategories } from "./use-categories";
import { handleUnsubscribe as handleCategoryUnsubscribe } from "./use-unsub-from-category";
import { handleCategoryResubscribe } from "./use-resubscribe-to-category";
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
  emailId,
  peopleEmailId,
  unsubscribeAll,
}: {
  emailId: number;
  peopleEmailId: number;
  unsubscribeAll: (emailId: number, peopleEmailId: number) => Promise<void>;
}) {
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingCategories, setTogglingCategories] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories(emailId, peopleEmailId);
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [emailId, peopleEmailId]);

  const handleUnsubscribe = async () => {
    try {
      setIsUnsubscribing(true);
      await unsubscribeAll(emailId, peopleEmailId);
      setUnsubscribed(true);
    } finally {
      setIsUnsubscribing(false);
    }
  };

  const handleCategoryToggle = async (category: Category) => {
    try {
      setTogglingCategories((prev) => new Set([...prev, category.category_id]));

      if (category.is_unsubscribed) {
        await handleCategoryResubscribe(peopleEmailId, category.category_id);
      } else {
        await handleCategoryUnsubscribe(
          emailId,
          peopleEmailId,
          category.category_id,
        );
      }

      // Update the local state
      setCategories((prevCategories) =>
        prevCategories.map((c) =>
          c.category_id === category.category_id
            ? { ...c, is_unsubscribed: !c.is_unsubscribed }
            : c,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle category subscription:", error);
    } finally {
      setTogglingCategories((prev) => {
        const newSet = new Set(prev);
        newSet.delete(category.category_id);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto mt-10 max-w-lg">
        <div className="mx-3 flex flex-col items-center rounded-md border bg-card p-4">
          <div className="h-8 w-8">
            <LoaderIcon />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading categories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-lg">
      <div className="mx-3 flex flex-col rounded-md border bg-card p-4">
        {unsubscribed ? (
          <>
            <h1 className="text-2xl font-bold">Unsubscribed</h1>
            <p className="text-sm text-muted-foreground">
              You have successfully unsubscribed from future emails.
            </p>
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
