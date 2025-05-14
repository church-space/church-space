"use server";

import { createClient } from "@church-space/supabase/server";
import { authActionClient } from "./safe-action";
import { z } from "zod";

// Add PCOConnection interface
interface PCOConnection {
  id: number;
  access_token: string;
  refresh_token: string;
  pco_organization_id: string;
  last_refreshed: string | null;
}

// Add fetchPCOWithRetry function (adapted from import-subscribes.ts)
const fetchPCOWithRetry = async (
  url: string,
  options: RequestInit,
  supabaseClient: any, // Using 'any' for simplicity, consider a more specific type
  orgId: string,
  pcoConn: PCOConnection,
  retryCount = 0,
): Promise<Response> => {
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${pcoConn.access_token}`,
  };

  let response = await fetch(url, options);

  if (response.status === 401 && retryCount < 1) {
    console.warn(
      `PCO API returned 401 for ${url}. Attempting to refresh token.`,
    );
    try {
      const refreshResponse = await fetch(
        "https://api.planningcenteronline.com/oauth/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id: process.env.PCO_CLIENT_ID!,
            client_secret: process.env.PCO_CLIENT_SECRET!,
            refresh_token: pcoConn.refresh_token,
          }).toString(),
        },
      );

      if (!refreshResponse.ok) {
        const errorData = await refreshResponse.json();
        console.error("Failed to refresh PCO token.", {
          status: refreshResponse.status,
          errorData,
        });
        return response;
      }

      const tokenData = await refreshResponse.json();
      console.log("Successfully refreshed PCO token.");

      pcoConn.access_token = tokenData.access_token;
      if (tokenData.refresh_token) {
        pcoConn.refresh_token = tokenData.refresh_token;
      }
      pcoConn.last_refreshed = new Date().toISOString();

      const { error: updateError } = await supabaseClient
        .from("pco_connections")
        .update({
          access_token: pcoConn.access_token,
          refresh_token: pcoConn.refresh_token,
          last_refreshed: pcoConn.last_refreshed,
        })
        .eq("organization_id", orgId);

      if (updateError) {
        console.error("Failed to update PCO token in database.", {
          error: updateError,
        });
      }

      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${pcoConn.access_token}`,
      };
      response = await fetch(url, options);
    } catch (refreshError) {
      console.error("Error during PCO token refresh process:", {
        error:
          refreshError instanceof Error
            ? refreshError.message
            : String(refreshError),
      });
      return response;
    }
  }

  if (response.status === 429) {
    const retryAfterHeader = response.headers.get("Retry-After");
    console.warn("Rate limit hit for PCO API", {
      url,
      status: response.status,
      retryAfter: retryAfterHeader || "N/A",
    });

    if (retryCount < 2) {
      let waitSeconds = 20;
      if (retryAfterHeader) {
        const parsedRetryAfter = parseInt(retryAfterHeader, 10);
        if (!isNaN(parsedRetryAfter) && parsedRetryAfter > 0) {
          waitSeconds = parsedRetryAfter;
        }
      }
      console.log(
        `Rate limit: Retrying PCO API call to ${url} after ${waitSeconds} seconds (attempt ${retryCount + 2} of 3)...`,
      );
      // In a serverless environment, proper async sleep/wait is needed.
      // For simplicity in this example, direct recursive call without true async sleep.
      // Consider using a library or utility for async sleep if this were a long-running job.
      await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
      return fetchPCOWithRetry(
        url,
        options,
        supabaseClient,
        orgId,
        pcoConn,
        retryCount + 1,
      );
    } else {
      console.error(
        `Max retries (3 total attempts) reached for PCO API call to ${url} after rate limiting.`,
      );
      return response;
    }
  }
  return response;
};

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
    const { data: pcoConnectionData, error: pcoConnectionError } =
      await supabase
        .from("pco_connections")
        .select("*") // Select all fields to match PCOConnection interface
        .eq("organization_id", parsedInput.organizationId)
        .single();

    if (pcoConnectionError || !pcoConnectionData) {
      throw new Error("No PCO connection found");
    }

    // Cast to PCOConnection type
    const pcoConnection: PCOConnection = pcoConnectionData as PCOConnection;

    // Get existing webhooks from PCO
    const webhooksResponse = await fetchPCOWithRetry(
      "https://api.planningcenteronline.com/webhooks/v2/webhook_subscriptions",
      {
        headers: {
          // Authorization Bearer token is set by fetchPCOWithRetry
          "X-PCO-API-Version": "2022-10-20",
        },
      },
      supabase,
      parsedInput.organizationId,
      pcoConnection,
    );

    const webhooksData = await webhooksResponse.json();

    // Delete webhooks that match our URL pattern
    for (const webhook of webhooksData.data) {
      if (
        webhook.attributes.url.startsWith(
          "https://churchspace.co/api/pco/webhook/",
        )
      ) {
        await fetchPCOWithRetry(
          `https://api.planningcenteronline.com/webhooks/v2/webhook_subscriptions/${webhook.id}`,
          {
            method: "DELETE",
            headers: {
              // Authorization Bearer token is set by fetchPCOWithRetry
              "X-PCO-API-Version": "2022-10-20",
            },
          },
          supabase,
          parsedInput.organizationId,
          pcoConnection,
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
