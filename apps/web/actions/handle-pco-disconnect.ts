"use server";

import { createClient } from "@church-space/supabase/server";
import { authActionClient } from "./safe-action";
import { z } from "zod";

const schema = z.object({
  organizationId: z.string(),
});

const handlePcoDisconnect = authActionClient
  .schema(schema)
  .metadata({
    name: "handle-pco-disconnect",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    // Get the PCO connection details
    const { data: pcoConnection, error: pcoConnectionError } = await supabase
      .from("pco_connections")
      .select("*")
      .eq("organization_id", parsedInput.organizationId)
      .single();

    if (pcoConnectionError || !pcoConnection) {
      throw new Error("No PCO connection found");
    }

    // Get existing webhooks from PCO
    const webhooksResponse = await fetch(
      "https://api.planningcenteronline.com/webhooks/v2/subscriptions",
      {
        headers: {
          Authorization: `Bearer ${pcoConnection.access_token}`,
        },
      },
    );

    const webhooksData = await webhooksResponse.json();

    // Delete webhooks that match our URL pattern
    for (const webhook of webhooksData.data) {
      if (
        webhook.attributes.url.startsWith(
          "https://churchspace.co/api/pco/webhook/",
        )
      ) {
        await fetch(
          `https://api.planningcenteronline.com/webhooks/v2/subscriptions/${webhook.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${pcoConnection.access_token}`,
            },
          },
        );
      }
    }

    // Delete webhooks from our database for this organization
    await supabase
      .from("pco_webhooks")
      .delete()
      .eq("organization_id", parsedInput.organizationId);

    // Delete the PCO connection
    const { error: deleteConnectionError } = await supabase
      .from("pco_connections")
      .delete()
      .eq("organization_id", parsedInput.organizationId)
      .eq("id", pcoConnection.id);

    if (deleteConnectionError) {
      throw new Error("Failed to delete PCO connection");
    }

    return { success: true };
  });

export { handlePcoDisconnect };
