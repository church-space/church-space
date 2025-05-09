import { Users } from "@church-space/ui/icons";
import { Plus } from "lucide-react";

export default function NullState({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center rounded-lg p-6"
      onClick={onClick}
    >
      <div className="relative mb-8 w-64">
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-md">
          <div className="flex items-center gap-2">
            <Users height={"20"} width={"20"} />
            <div className="h-6 w-1/3 rounded bg-muted"></div>
          </div>
          <div className="h-4 w-full rounded bg-muted"></div>
          <div className="h-4 w-3/4 rounded bg-muted"></div>
        </div>
        <div className="absolute -right-3 -top-3 rounded-full border bg-card p-1 shadow-sm">
          <Plus className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <h3 className="mb-4 text-center text-xl font-medium text-muted-foreground">
        No people found
      </h3>
    </div>
  );
}
