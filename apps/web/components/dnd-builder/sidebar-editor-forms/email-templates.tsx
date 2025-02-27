import { Button } from "@church-space/ui/button";
import { Card, CardContent } from "@church-space/ui/card";
import { LayoutGrid } from "lucide-react";

interface EmailTemplateFormProps {
  onSelectTemplate?: (templateId: string) => void;
}

export default function EmailTemplateForm({
  onSelectTemplate,
}: EmailTemplateFormProps) {
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
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Email Templates</h2>
      <p className="text-sm text-muted-foreground">
        Select a template to use as a starting point for your email.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelectTemplate?.(template.id)}
          >
            <CardContent className="p-3 flex flex-col gap-2">
              <div className="bg-accent rounded-md p-2 flex items-center justify-center">
                <LayoutGrid className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-sm">{template.name}</h3>
              <p className="text-xs text-muted-foreground">
                {template.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" className="mt-2">
        Browse More Templates
      </Button>
    </div>
  );
}
