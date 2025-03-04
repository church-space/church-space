import { cookies } from "next/headers";
import ClientPage from "./client-page";

type Params = Promise<{ emailId: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const emailId = parseInt(params.emailId, 10);

  // Get organizationId from cookies
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("organizationId")?.value;

  console.log(organizationId);

  return <ClientPage emailId={emailId} />;
}
