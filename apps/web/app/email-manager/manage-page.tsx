"use client";
import { Button } from "@church-space/ui/button";
import { Switch } from "@church-space/ui/switch";
import React, { useEffect, useState } from "react";
import { LoaderIcon } from "@church-space/ui/icons";
import { getCategories } from "./use-categories";

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
            <div className="mt-4 space-y-4">
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
                  <Switch checked={!category.is_unsubscribed} disabled={true} />
                </div>
              ))}
            </div>
            <Button
              className="mt-6 w-full"
              onClick={handleUnsubscribe}
              disabled={isUnsubscribing}
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
          </>
        )}
      </div>
    </div>
  );
}
