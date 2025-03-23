import { Button } from "@church-space/ui/button";
import { cn } from "@church-space/ui/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@church-space/ui/select";
import React from "react";
import Link from "next/link";
interface SettingsSection {
  title: string;
  description: string;
  actionType: "button" | "select";
  actionLabel: string;
  selectOptions?: { label: string; value: string }[];
  action?: () => void;
  selectValue?: string;
  buttonLink?: string;
  buttonAction?: () => void;
}

interface SettingsSectionProps {
  title: string;
  description?: string;
  descriptionObject?: React.ReactNode;
  sections: SettingsSection[];
}

export default function SettingsSettings({
  title,
  description,
  descriptionObject,
  sections,
}: SettingsSectionProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col">
      <h2 className="pl-1 text-lg font-bold">{title}</h2>
      {description && (
        <p className="pl-1 text-sm text-muted-foreground">{description}</p>
      )}
      {descriptionObject && descriptionObject}
      <div className="mt-3 flex w-full flex-col rounded-lg border">
        {sections.map((section, index) => (
          <div
            className={cn(
              "flex w-full justify-between p-4",
              index != 0 && "border-t",
            )}
            key={section.title}
          >
            <div className="flex flex-col">
              <h3 className="text-sm font-medium">{section.title}</h3>
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            </div>
            <div className="flex flex-col">
              {section.actionType === "button" && (
                <Link href={section.buttonLink || ""}>
                  <Button onClick={section.buttonAction}>
                    {section.actionLabel}
                  </Button>
                </Link>
              )}
              {section.actionType === "select" && (
                <Select value={section.selectValue}>
                  <SelectTrigger>{section.actionLabel}</SelectTrigger>
                  <SelectContent align="end">
                    {section.selectOptions?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
