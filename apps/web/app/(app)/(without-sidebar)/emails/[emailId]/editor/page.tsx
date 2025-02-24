import DndProvider from "@/components/dnd-builder/dnd-provider";
import { createClient } from "@trivo/supabase/server";

type Params = Promise<{ emailId: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const emailId = parseInt(params.emailId, 10);

  // We don't need to fetch data here since DndProvider will fetch it
  return <DndProvider emailId={emailId} />;
}
