import { Button } from "@church-space/ui/button";
import { Card, CardContent } from "@church-space/ui/card";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";
import { Save } from "lucide-react";
import { useState } from "react";
import AssetBrowserModal from "../asset-browser";

interface EmailTemplateFormProps {
  onSelectTemplate?: (templateId: string) => void;
}

export default function EmailTemplateForm({
  onSelectTemplate,
}: EmailTemplateFormProps) {
  const [search, setSearch] = useState("");
  console.log(search);

  const templates = [
    {
      id: "welcome",
      name: "Welcome Email",
      description: "A welcome email for new users",
    },
    {
      id: "newsletter",
      name: "Newsletter",
      description: "A standard newsletter template",
    },
    {
      id: "promotion",
      name: "Promotion",
      description: "Promotional email with call to action",
    },
    {
      id: "announcement",
      name: "Announcement",
      description: "Important announcement template",
    },
  ];

  return (
    <div className="flex flex-col gap-5 px-1">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Email Templates</h2>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <AssetBrowserModal
                  triggerText="Gallery"
                  buttonClassName="h-8 py-0 px-2.5"
                  onSelectAsset={() => {}}
                  organizationId={"213"}
                  handleDelete={() => {}}
                />
              </TooltipTrigger>
              <TooltipContent>Browse premade templates</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="h-8 px-2 py-0">
                  <Save />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save current email as template</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Select a template from the gallery or use one of your own.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="px-1 text-sm text-secondary-foreground">
          Your Templates
        </Label>
        <Input
          placeholder="Search your templates"
          className="mb-3 w-full"
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer transition-colors hover:border-primary"
              onClick={() => onSelectTemplate?.(template.id)}
            >
              <CardContent className="flex flex-col gap-2 p-3">
                <h3 className="text-sm font-medium">{template.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {template.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
