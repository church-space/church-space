import "server-only";

import { task, wait, timeout } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";
import Papa from "papaparse";
import { z } from "zod";

const importSubscibesPayload = z.object({
  organizationId: z.string().uuid(),
  fileUrl: z.string().url(),
  emailColumn: z.string(),
  firstNameColumn: z.string(),
  lastNameColumn: z.string(),
  tagsColumn: z.string().nullable(),
});

export const importSubscibes = task({
  id: "import-subscibes",
  maxDuration: timeout.None,
  run: async (payload: z.infer<typeof importSubscibesPayload>, io) => {
    const {
      organizationId,
      fileUrl,
      emailColumn,
      firstNameColumn,
      lastNameColumn,
      tagsColumn,
    } = payload;
    const supabase = createClient();
    const uniqueTags = new Set<string>();
    let tagsFieldDefinitionId: string | null = null;

    // Helper function to parse tags from a CSV cell value
    const getTagsFromCsvCell = (cellValue: string | undefined): string[] => {
      const collectedTags = new Set<string>();

      const processStringValue = (str: string) => {
        const trimmedStr = str.trim();
        if (trimmedStr === "") return;

        // Attempt to parse as JSON if it looks like an array
        if (trimmedStr.startsWith("[") && trimmedStr.endsWith("]")) {
          try {
            const parsedJson = JSON.parse(trimmedStr);
            if (Array.isArray(parsedJson)) {
              // It's a valid JSON array. Process its elements.
              // Each element could be a simple string, or a string containing commas.
              parsedJson.forEach((element) => {
                if (typeof element === "string") {
                  element.split(",").forEach((tagPart) => {
                    const finalTag = tagPart.trim();
                    if (finalTag) collectedTags.add(finalTag);
                  });
                }
                // Non-string elements within the parsed array are ignored
              });
              return; // Processed as JSON array, no further action on trimmedStr
            }
            // Parsed, but not an array (e.g. "{}"). Fall through to treat as simple string.
          } catch (e) {
            // JSON.parse failed. Fall through to treat as simple string.
          }
        }

        // Fallback: Treat as a simple comma-separated string
        trimmedStr.split(",").forEach((tagPart) => {
          const finalTag = tagPart.trim();
          if (finalTag) collectedTags.add(finalTag);
        });
      };

      if (cellValue) {
        processStringValue(cellValue);
      }

      return Array.from(collectedTags);
    };

    const fetchPCOWithRetry = async (
      url: string,
      options: RequestInit,
      retryCount = 0,
    ): Promise<Response> => {
      const response = await fetch(url, options);

      if (response.status === 429) {
        const rateLimit = response.headers.get("X-PCO-API-Request-Rate-Limit");
        const ratePeriod = response.headers.get(
          "X-PCO-API-Request-Rate-Period",
        );
        const rateCount = response.headers.get("X-PCO-API-Request-Rate-Count");
        const retryAfterHeader = response.headers.get("Retry-After");

        console.warn("Rate limit hit for PCO API", {
          url,
          status: response.status,
          rateLimit: rateLimit || "N/A",
          ratePeriod: ratePeriod || "N/A",
          rateCount: rateCount || "N/A",
          retryAfter: retryAfterHeader || "N/A",
        });

        if (retryCount < 2) {
          // Max 2 retries (total 3 attempts)
          let waitSeconds = 20; // Default wait time if Retry-After is not available or invalid
          if (retryAfterHeader) {
            const parsedRetryAfter = parseInt(retryAfterHeader, 10);
            if (!isNaN(parsedRetryAfter) && parsedRetryAfter > 0) {
              waitSeconds = parsedRetryAfter;
            }
          }
          console.log(
            `Rate limit: Retrying PCO API call to ${url} after ${waitSeconds} seconds (attempt ${retryCount + 2} of 3)...`,
          );
          await wait.for({ seconds: waitSeconds });
          return fetchPCOWithRetry(url, options, retryCount + 1);
        } else {
          console.error(
            `Max retries (3 total attempts) reached for PCO API call to ${url} after rate limiting. Will not retry further.`,
          );
          return response; // Return the last 429 response to be handled by the calling code
        }
      }
      return response;
    };

    // Fetch the CSV file content
    const response = await fetch(fileUrl, {
      method: "GET",
      headers: {
        Accept: "text/csv",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch CSV content.", {
        fileUrl,
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(
        `Failed to fetch CSV content: ${response.status} ${response.statusText}`,
      );
    }

    const csvContent = await response.text();

    if (!csvContent) {
      console.error("Fetched CSV content is empty.", { fileUrl });
      throw new Error("Fetched CSV content is empty.");
    }

    // Parse the CSV content
    const parseResult = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error("Failed to parse CSV.", {
        errors: parseResult.errors,
      });
      throw new Error(`Failed to parse CSV: ${parseResult.errors[0]?.message}`);
    }

    if (parseResult.data.length === 0) {
      return { message: "CSV file is empty or contains no data rows." };
    }

    // Validate that required columns exist in the headers
    const headers = parseResult.meta.fields;

    // Define base required columns
    const baseRequiredColumns = [emailColumn, firstNameColumn, lastNameColumn];
    // Conditionally add tagsColumn if it's provided
    const allRequiredColumns = [...baseRequiredColumns];
    if (tagsColumn && tagsColumn.trim() !== "") {
      allRequiredColumns.push(tagsColumn);
    }

    const missingHeaders = allRequiredColumns.filter(
      (col) => !headers || !headers.includes(col),
    );

    if (missingHeaders.length > 0) {
      console.error("One or more required columns not found in CSV headers.", {
        headers,
        requiredColumns: allRequiredColumns,
        missing: missingHeaders,
      });
      throw new Error(
        `The following required columns were not found in the CSV: ${missingHeaders.join(", ")}. Available headers: ${headers?.join(", ")}`,
      );
    }

    // Extract and log tags if tagsColumn is specified
    if (
      tagsColumn &&
      tagsColumn.trim() !== "" &&
      headers &&
      headers.includes(tagsColumn)
    ) {
      parseResult.data.forEach((row) => {
        const tagsValue = row[tagsColumn];
        const parsedTags = getTagsFromCsvCell(tagsValue);
        parsedTags.forEach((tag) => uniqueTags.add(tag));
      });

      if (uniqueTags.size > 0) {
        console.log("Unique tags found in the CSV:", Array.from(uniqueTags));
      }
    }

    // Process CSV data and fill empty names with "Friend"
    const processedData = parseResult.data
      .map((row) => {
        const email = row[emailColumn]?.trim();
        const firstName = row[firstNameColumn]?.trim() || "Friend";
        const lastName = row[lastNameColumn]?.trim() || "Friend";
        let personTags: string[] = [];

        if (tagsColumn && tagsColumn.trim() !== "" && row[tagsColumn]) {
          personTags = getTagsFromCsvCell(row[tagsColumn]);
        }

        // Validate email using Zod
        const validationResult = z.string().email().safeParse(email);
        if (validationResult.success) {
          return {
            email_address: validationResult.data.toLowerCase(),
            first_name: firstName,
            last_name: lastName,
            tags: personTags,
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (processedData.length === 0) {
      return {
        message: "No valid email addresses found in the specified column.",
      };
    }

    // Get all matching emails from people_emails table with pagination
    const matchingPeople: any[] = [];
    const nonMatchingPeople: any[] = [];
    const pageSize = 50;

    // Process emails in chunks of 50
    for (let i = 0; i < processedData.length; i += pageSize) {
      const emailChunk = processedData.slice(i, i + pageSize);

      const { data: existingEmails, error: fetchError } = await supabase
        .from("people_emails")
        .select("email, pco_person_id")
        .eq("organization_id", organizationId)
        .in(
          "email",
          emailChunk.map((d) => d.email_address),
        )
        .range(0, pageSize - 1);

      if (fetchError) {
        console.error("Failed to fetch existing emails.", {
          error: fetchError,
        });
        throw new Error(
          `Failed to fetch existing emails: ${fetchError.message}`,
        );
      }

      if (!existingEmails || existingEmails.length === 0) {
        // If no matches found for this chunk, add all to non-matching
        nonMatchingPeople.push(...emailChunk);
        continue;
      }

      // Create a map of existing emails for quick lookup
      const existingEmailsMap = new Map();
      existingEmails.forEach((e) => {
        if (!existingEmailsMap.has(e.email)) {
          existingEmailsMap.set(e.email, []);
        }
        existingEmailsMap.get(e.email).push(e.pco_person_id);
      });

      // Process each row from the current chunk
      emailChunk.forEach((row) => {
        const pcoPersonIds = existingEmailsMap.get(row.email_address);
        if (pcoPersonIds && pcoPersonIds.length > 0) {
          // Add an entry for each person ID associated with this email
          pcoPersonIds.forEach((pcoPersonId: string) => {
            matchingPeople.push({
              ...row,
              pco_person_id: pcoPersonId,
            });
          });
        } else {
          nonMatchingPeople.push(row);
        }
      });
    }

    // Get PCO connection for the organization
    const { data: pcoConnection, error: pcoConnectionError } = await supabase
      .from("pco_connections")
      .select("access_token, pco_organization_id")
      .eq("organization_id", organizationId)
      .single();

    if (pcoConnectionError || !pcoConnection) {
      console.error("Failed to fetch PCO connection.", {
        error: pcoConnectionError,
      });
      throw new Error("Failed to fetch PCO connection");
    }

    // Check if Church Space tab already exists
    const tabsResponse = await fetchPCOWithRetry(
      `https://api.planningcenteronline.com/people/v2/tabs?include=field_definitions`,
      {
        headers: {
          Authorization: `Bearer ${pcoConnection.access_token}`,
          "X-PCO-API-Version": "2024-09-12",
        },
      },
    );

    if (!tabsResponse.ok) {
      const errorData = await tabsResponse.json();
      console.error("Failed to fetch PCO tabs.", {
        status: tabsResponse.status,
        error: errorData,
      });
      throw new Error(`Failed to fetch PCO tabs: ${tabsResponse.statusText}`);
    }

    const tabsData = await tabsResponse.json();
    const existingTab = tabsData.data.find(
      (tab: any) => tab.attributes.name === "Church Space",
    );
    let tabId = "";
    let fieldDefinitionId: string | null = null;

    if (existingTab) {
      tabId = existingTab.id;
      console.log(`Using existing 'Church Space' tab with ID: ${tabId}`);

      // Check if "Subscribed on Former Platform" field already exists in this tab
      const subscribedFieldDef = tabsData.included?.find(
        (item: any) =>
          item.type === "FieldDefinition" &&
          item.relationships?.tab?.data?.id === tabId &&
          item.attributes.name === "Subscribed on Former Platform",
      );
      if (subscribedFieldDef) {
        fieldDefinitionId = subscribedFieldDef.id;
        console.log(
          `Found existing 'Subscribed on Former Platform' field with ID: ${fieldDefinitionId} in tab ${tabId}`,
        );
      }

      // Check if "Tags" field already exists in this tab
      if (uniqueTags.size > 0) {
        const tagsFieldDef = tabsData.included?.find(
          (item: any) =>
            item.type === "FieldDefinition" &&
            item.relationships?.tab?.data?.id === tabId &&
            item.attributes.name === "Tags",
        );
        if (tagsFieldDef) {
          if (tagsFieldDef.attributes.data_type === "checkboxes") {
            tagsFieldDefinitionId = tagsFieldDef.id;
            console.log(
              `Found existing 'Tags' field (checkboxes) with ID: ${tagsFieldDefinitionId} in tab ${tabId}`,
            );
          } else {
            console.warn(
              `Found existing 'Tags' field in tab ${tabId} with ID: ${tagsFieldDef.id}, but it is of type '${tagsFieldDef.attributes.data_type}' instead of 'checkboxes'. Tag import for this field will be skipped. A new 'Tags' field of type 'checkboxes' will be created if needed.`,
            );
            tagsFieldDefinitionId = null;
          }
        }
      }
    } else {
      // Create custom tab in Planning Center
      const pcoResponse = await fetchPCOWithRetry(
        `https://api.planningcenteronline.com/people/v2/tabs`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${pcoConnection.access_token}`,
            "Content-Type": "application/json",
            "X-PCO-API-Version": "2024-09-12",
          },
          body: JSON.stringify({
            data: {
              type: "Tab",
              attributes: {
                name: "Church Space",
              },
            },
          }),
        },
      );

      if (!pcoResponse.ok) {
        const errorData = await pcoResponse.json();
        console.error("Failed to create PCO tab.", {
          status: pcoResponse.status,
          error: errorData,
          errors: errorData.errors
            ? JSON.stringify(errorData.errors)
            : undefined,
        });
        throw new Error(`Failed to create PCO tab: ${pcoResponse.statusText}`);
      }

      const tabData = await pcoResponse.json();

      tabId = tabData.data.id;
      console.log(
        // Added for consistency
        `Created new 'Church Space' tab with ID: ${tabId}`,
      );
    }

    // Removed the separate field fetching section since we now get fields with tabs
    if (!fieldDefinitionId) {
      // Create boolean field for "Subscribed on Former Platform"
      const booleanFieldResponse = await fetchPCOWithRetry(
        `https://api.planningcenteronline.com/people/v2/tabs/${tabId}/field_definitions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${pcoConnection.access_token}`,
            "Content-Type": "application/json",
            "X-PCO-API-Version": "2024-09-12",
          },
          body: JSON.stringify({
            data: {
              type: "FieldDefinition",
              attributes: {
                name: "Subscribed on Former Platform",
                data_type: "boolean",
              },
            },
          }),
        },
      );

      if (!booleanFieldResponse.ok) {
        const errorData = await booleanFieldResponse.json();
        console.error("Failed to create boolean field.", {
          status: booleanFieldResponse.status,
          error: errorData,
          errorDetails: errorData.errors
            ? JSON.stringify(errorData.errors)
            : undefined,
          statusText: booleanFieldResponse.statusText,
        });

        // Don't continue with adding people if field creation fails
        return {
          message: "Import aborted: Failed to create subscription field in PCO",
          processedCount: processedData.length,
          matchingCount: matchingPeople.length,
          nonMatchingCount: nonMatchingPeople.length,
          tabCreated: true,
          fieldsCreated: false,
          error: errorData.errors
            ? JSON.stringify(errorData.errors)
            : booleanFieldResponse.statusText,
        };
      } else {
        const booleanFieldData = await booleanFieldResponse.json();

        fieldDefinitionId = booleanFieldData.data.id;
      }
    }

    // Create "Tags" field definition if there are unique tags AND it wasn't found yet
    if (!tagsFieldDefinitionId && uniqueTags.size > 0 && tabId) {
      try {
        const tagsFieldResponse = await fetchPCOWithRetry(
          `https://api.planningcenteronline.com/people/v2/tabs/${tabId}/field_definitions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${pcoConnection.access_token}`,
              "Content-Type": "application/json",
              "X-PCO-API-Version": "2024-09-12",
            },
            body: JSON.stringify({
              data: {
                type: "FieldDefinition",
                attributes: {
                  name: "Tags",
                  data_type: "checkboxes", // As per user request
                  config: {
                    // Required for checkboxes, even if empty initially
                    options: [],
                  },
                },
              },
            }),
          },
        );

        if (!tagsFieldResponse.ok) {
          const errorData = await tagsFieldResponse.json();
          console.error("Failed to create 'Tags' field definition.", {
            status: tagsFieldResponse.status,
            error: errorData,
            errorDetails: errorData.errors
              ? JSON.stringify(errorData.errors)
              : undefined,
            statusText: tagsFieldResponse.statusText,
          });
          // Not throwing an error here, as we can still proceed with other operations
        } else {
          const tagsFieldData = await tagsFieldResponse.json();
          tagsFieldDefinitionId = tagsFieldData.data.id;
          console.log(
            "Successfully created 'Tags' field definition with ID:",
            tagsFieldDefinitionId,
          );
        }
      } catch (error) {
        console.error("Error creating 'Tags' field definition:", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Create field options for each unique tag if Tags field was created/found
    if (tagsFieldDefinitionId && uniqueTags.size > 0) {
      console.log(
        `Processing ${uniqueTags.size} unique tags for field ID: ${tagsFieldDefinitionId}`,
      );

      for (const tag of Array.from(uniqueTags)) {
        try {
          const fieldOptionResponse = await fetchPCOWithRetry(
            `https://api.planningcenteronline.com/people/v2/field_definitions/${tagsFieldDefinitionId}/field_options`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${pcoConnection.access_token}`,
                "Content-Type": "application/json",
                "X-PCO-API-Version": "2024-09-12",
              },
              body: JSON.stringify({
                data: {
                  type: "FieldOption",
                  attributes: {
                    value: tag,
                  },
                },
              }),
            },
          );

          if (!fieldOptionResponse.ok) {
            const errorData = await fieldOptionResponse.json();
            console.error(`Failed to create field option for tag: ${tag}`, {
              status: fieldOptionResponse.status,
              error: errorData,
              tag,
            });
          } else {
            const fieldOptionData = await fieldOptionResponse.json();
            console.log(
              `Successfully created field option for tag: ${tag}, ID: ${fieldOptionData.data.id}`,
            );
          }
        } catch (error) {
          console.error(`Error creating field option for tag: ${tag}`, {
            error: error instanceof Error ? error.message : String(error),
            tag,
          });
        }
      }
    }

    // Mark matching people as subscribed in PCO
    const subscriptionResults = [];

    // First, mark existing people as subscribed - only if we have a field to update
    for (const person of matchingPeople) {
      try {
        // Skip field data operations if fieldDefinitionId is null (field creation failed)
        if (!fieldDefinitionId) {
          subscriptionResults.push({
            email: person.email_address,
            success: true,
            note: "Imported without subscription flag due to field creation failure",
          });
          continue;
        }

        const fieldDatumResponse = await fetchPCOWithRetry(
          `https://api.planningcenteronline.com/people/v2/people/${person.pco_person_id}/field_data`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${pcoConnection.access_token}`,
              "Content-Type": "application/json",
              "X-PCO-API-Version": "2024-09-12",
            },
            body: JSON.stringify({
              data: {
                type: "FieldDatum",
                attributes: {
                  value: true,
                },
                relationships: {
                  field_definition: {
                    data: {
                      type: "FieldDefinition",
                      id: fieldDefinitionId,
                    },
                  },
                },
              },
            }),
          },
        );

        if (!fieldDatumResponse.ok) {
          const errorData = await fieldDatumResponse.json();
          console.error("Failed to mark person as subscribed.", {
            personId: person.pco_person_id,
            email: person.email_address,
            status: fieldDatumResponse.status,
            error: errorData,
          });
          subscriptionResults.push({
            email: person.email_address,
            success: false,
            error: errorData,
          });
        } else {
          subscriptionResults.push({
            email: person.email_address,
            success: true,
          });
        }

        // If tags field exists and person has tags, update their tags field data
        if (tagsFieldDefinitionId && person.tags && person.tags.length > 0) {
          for (const tag of person.tags) {
            try {
              const updateTagResponse = await fetchPCOWithRetry(
                `https://api.planningcenteronline.com/people/v2/people/${person.pco_person_id}/field_data`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${pcoConnection.access_token}`,
                    "Content-Type": "application/json",
                    "X-PCO-API-Version": "2024-09-12",
                  },
                  body: JSON.stringify({
                    data: {
                      type: "FieldDatum",
                      attributes: {
                        value: tag, // Send individual tag string
                      },
                      relationships: {
                        field_definition: {
                          data: {
                            type: "FieldDefinition",
                            id: tagsFieldDefinitionId,
                          },
                        },
                      },
                    },
                  }),
                },
              );

              if (!updateTagResponse.ok) {
                const errorData = await updateTagResponse.json();
                console.error("Failed to update tag for existing person.", {
                  personId: person.pco_person_id,
                  email: person.email_address,
                  tag: tag,
                  status: updateTagResponse.status,
                  error: errorData,
                });
                // Optionally add to subscriptionResults or a new array for tag update results
              } else {
                console.log(
                  `Successfully updated tag '${tag}' for person ${person.pco_person_id}`,
                );
              }
            } catch (tagError) {
              console.error("Error updating tag for existing person:", {
                personId: person.pco_person_id,
                email: person.email_address,
                tag: tag,
                error:
                  tagError instanceof Error
                    ? tagError.message
                    : String(tagError),
              });
            }
          }
        }
      } catch (error) {
        console.error("Error marking person as subscribed:", {
          personId: person.pco_person_id,
          email: person.email_address,
          error,
        });
        subscriptionResults.push({
          email: person.email_address,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Now create new people for non-matching subscribers
    const newPersonResults = [];
    for (const person of nonMatchingPeople) {
      try {
        // Create new person
        const createPersonResponse = await fetchPCOWithRetry(
          `https://api.planningcenteronline.com/people/v2/people`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${pcoConnection.access_token}`,
              "Content-Type": "application/json",
              "X-PCO-API-Version": "2024-09-12",
            },
            body: JSON.stringify({
              data: {
                type: "Person",
                attributes: {
                  first_name: person.first_name,
                  last_name: person.last_name,
                },
              },
            }),
          },
        );

        if (!createPersonResponse.ok) {
          const errorData = await createPersonResponse.json();
          console.error("Failed to create new person.", {
            email: person.email_address,
            status: createPersonResponse.status,
            error: errorData,
          });
          newPersonResults.push({
            email: person.email_address,
            success: false,
            error: errorData,
          });
          continue;
        }

        const newPersonData = await createPersonResponse.json();
        const newPersonId = newPersonData.data.id;

        // Add email address to the new person
        const addEmailResponse = await fetchPCOWithRetry(
          `https://api.planningcenteronline.com/people/v2/people/${newPersonId}/emails`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${pcoConnection.access_token}`,
              "Content-Type": "application/json",
              "X-PCO-API-Version": "2024-09-12",
            },
            body: JSON.stringify({
              data: {
                type: "Email",
                attributes: {
                  address: person.email_address,
                  location: "Home",
                  primary: true,
                },
              },
            }),
          },
        );

        if (!addEmailResponse.ok) {
          const errorData = await addEmailResponse.json();
          console.error("Failed to add email to new person.", {
            personId: newPersonId,
            email: person.email_address,
            status: addEmailResponse.status,
            error: errorData,
          });
          newPersonResults.push({
            email: person.email_address,
            success: false,
            error: errorData,
          });
          continue;
        }

        // Mark the new person as subscribed
        if (fieldDefinitionId) {
          const fieldDatumResponse = await fetchPCOWithRetry(
            `https://api.planningcenteronline.com/people/v2/people/${newPersonId}/field_data`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${pcoConnection.access_token}`,
                "Content-Type": "application/json",
                "X-PCO-API-Version": "2024-09-12",
              },
              body: JSON.stringify({
                data: {
                  type: "FieldDatum",
                  attributes: {
                    value: true,
                  },
                  relationships: {
                    field_definition: {
                      data: {
                        type: "FieldDefinition",
                        id: fieldDefinitionId,
                      },
                    },
                  },
                },
              }),
            },
          );

          if (!fieldDatumResponse.ok) {
            const errorData = await fieldDatumResponse.json();
            console.error("Failed to mark new person as subscribed.", {
              personId: newPersonId,
              email: person.email_address,
              status: fieldDatumResponse.status,
              error: errorData,
            });
            newPersonResults.push({
              email: person.email_address,
              success: true, // Still consider import successful
              personId: newPersonId,
              note: "Created without subscription flag due to field creation failure",
            });
          } else {
            newPersonResults.push({
              email: person.email_address,
              success: true,
              personId: newPersonId,
            });
          }
        } else {
          // No field definition ID, just mark as successful without trying to set the field
          newPersonResults.push({
            email: person.email_address,
            success: true,
            personId: newPersonId,
            note: "Created without subscription flag due to field creation failure",
          });
        }

        // If tags field exists and the new person has tags, set their tags field data
        if (tagsFieldDefinitionId && person.tags && person.tags.length > 0) {
          for (const tag of person.tags) {
            try {
              const setTagResponse = await fetchPCOWithRetry(
                `https://api.planningcenteronline.com/people/v2/people/${newPersonId}/field_data`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${pcoConnection.access_token}`,
                    "Content-Type": "application/json",
                    "X-PCO-API-Version": "2024-09-12",
                  },
                  body: JSON.stringify({
                    data: {
                      type: "FieldDatum",
                      attributes: {
                        value: tag, // Send individual tag string
                      },
                      relationships: {
                        field_definition: {
                          data: {
                            type: "FieldDefinition",
                            id: tagsFieldDefinitionId,
                          },
                        },
                      },
                    },
                  }),
                },
              );

              if (!setTagResponse.ok) {
                const errorData = await setTagResponse.json();
                console.error("Failed to set tag for new person.", {
                  personId: newPersonId,
                  email: person.email_address,
                  tag: tag,
                  status: setTagResponse.status,
                  error: errorData,
                });
                // Modify newPersonResults entry if needed
                const existingResult = newPersonResults.find(
                  (r) => r.personId === newPersonId,
                );
                if (existingResult) {
                  existingResult.note =
                    (existingResult.note ? existingResult.note + "; " : "") +
                    `Failed to set tag: ${tag}`;
                }
              } else {
                console.log(
                  `Successfully set tag '${tag}' for new person ${newPersonId}`,
                );
              }
            } catch (tagError) {
              console.error("Error setting tag for new person:", {
                personId: newPersonId,
                email: person.email_address,
                tag: tag,
                error:
                  tagError instanceof Error
                    ? tagError.message
                    : String(tagError),
              });
              const existingResult = newPersonResults.find(
                (r) => r.personId === newPersonId,
              );
              if (existingResult) {
                existingResult.note =
                  (existingResult.note ? existingResult.note + "; " : "") +
                  `Error setting tag: ${tag}`;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error creating new person:", {
          email: person.email_address,
          error,
        });
        newPersonResults.push({
          email: person.email_address,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      message: `Successfully processed ${processedData.length} records.`,
      processedCount: processedData.length,
      matchingCount: matchingPeople.length,
      nonMatchingCount: nonMatchingPeople.length,
      tabCreated: true,
      fieldsCreated: fieldDefinitionId !== null,
      fieldCreationIssue:
        fieldDefinitionId === null
          ? "Failed to create custom field (possibly due to insufficient permissions)"
          : null,
      subscriptionResults,
      newPersonResults,
    };
  },
});
