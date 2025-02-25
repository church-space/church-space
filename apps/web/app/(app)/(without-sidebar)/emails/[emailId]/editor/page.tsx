import DndProvider from "@/components/dnd-builder/dnd-provider";

type Params = Promise<{ emailId: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const emailId = parseInt(params.emailId, 10);

  console.log(emailId);

  return <DndProvider />;
}
