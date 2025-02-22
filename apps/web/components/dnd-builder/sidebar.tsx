import { cn } from "@trivo/ui/cn";
import {
  ArrowRight,
  Button,
  CircleUser,
  Divider,
  Download,
  Grid,
  Home,
  Image,
  Typography,
  Video,
  Section,
  List,
} from "@trivo/ui/icons";
import { useDraggable } from "@dnd-kit/core";

interface DndBuilderSidebarProps {
  className?: string;
  type: "email" | "form";
}

function DraggableBlock({
  block,
}: {
  block: { type: string; label: string; icon: any };
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `sidebar-${block.type}`,
    data: { type: block.type, fromSidebar: true },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="flex flex-col items-center gap-1 bg-accent p-3 rounded-md cursor-grab border shadow-sm"
    >
      <block.icon />
      <span>{block.label}</span>
    </div>
  );
}

export default function DndBuilderSidebar({
  className,
  type,
}: DndBuilderSidebarProps) {
  const allBlockTypes = [
    { label: "Text", type: "text", icon: Typography },
    { label: "Image", type: "image", icon: Image },
    { label: "Button", type: "button", icon: Button },
    { label: "File", type: "file-download", icon: Download },
    { label: "Divider", type: "divider", icon: Divider },
    { label: "Video", type: "video", icon: Video },
    { label: "Cards", type: "cards", icon: Grid },
    { label: "List", type: "list", icon: List },
    { label: "Author", type: "author", icon: CircleUser },
    { label: "Input", type: "input", icon: Home },
    { label: "Select", type: "select", icon: ArrowRight },
    { label: "Textarea", type: "textarea", icon: Home },
    { label: "Radio Buttons", type: "radio-buttons", icon: ArrowRight },
    { label: "Checkboxes", type: "checkboxes", icon: Home },
    { label: "File Upload", type: "file-upload", icon: ArrowRight },
    { label: "Rating", type: "rating", icon: Home },
    { label: "Address", type: "address", icon: ArrowRight },
  ];

  const emailBlockTypes = [
    "section",
    "text",
    "image",
    "button",
    "file-download",
    "divider",
    "video",
    "cards",
    "author",
    "list",
  ];

  const blockTypes =
    type === "email"
      ? allBlockTypes.filter((block) => emailBlockTypes.includes(block.type))
      : allBlockTypes;

  return (
    <div
      className={cn(
        "w-[400px] flex-shrink-0 bg-sidebar rounded-md h-[calc(100vh-5rem)] sticky top-16",
        className
      )}
    >
      <div className=" gap-2 p-4 grid grid-cols-3">
        {blockTypes.map((block) => (
          <DraggableBlock key={block.type} block={block} />
        ))}
      </div>
    </div>
  );
}
