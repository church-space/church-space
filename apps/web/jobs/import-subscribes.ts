import "server-only";

import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";
import Papa from "papaparse";
import { z } from "zod";

const importSubscibesPayload = z.object({
  organizationId: z.string().uuid(),
  fileUrl: z.string().url(),
  emailColumn: z.string(),
  firstNameColumn: z.string(),
  lastNameColumn: z.string(),
});

export const importSubscibes = task({
  id: "import-subscibes",
  run: async (payload: z.infer<typeof importSubscibesPayload>, io) => {
    const {
      organizationId,
      fileUrl,
      emailColumn,
      firstNameColumn,
      lastNameColumn,
    } = payload;
    const supabase = createClient();

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
    if (
      !headers ||
      !headers.includes(emailColumn) ||
      !headers.includes(firstNameColumn) ||
      !headers.includes(lastNameColumn)
    ) {
      console.error("Required columns not found in CSV headers.", {
        headers,
        requiredColumns: [emailColumn, firstNameColumn, lastNameColumn],
      });
      throw new Error(
        `Required columns not found in CSV headers. Available headers: ${headers?.join(", ")}`,
      );
    }

    // Process CSV data and fill empty names with "Friend"
    const processedData = parseResult.data
      .map((row) => {
        const email = row[emailColumn]?.trim();
        const firstName = row[firstNameColumn]?.trim() || "Friend";
        const lastName = row[lastNameColumn]?.trim() || "Friend";

        // Validate email using Zod
        const validationResult = z.string().email().safeParse(email);
        if (validationResult.success) {
          return {
            email_address: validationResult.data.toLowerCase(),
            first_name: firstName,
            last_name: lastName,
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

    console.log("Matching people:", matchingPeople);
    console.log("Non-matching people:", nonMatchingPeople);

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
    const tabsResponse = await fetch(
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
      console.log("Found existing Church Space tab:", existingTab);
      tabId = existingTab.id;

      // Check if the field already exists in the included field definitions
      const fieldDefinitions = tabsData.included?.filter(
        (item: any) =>
          item.type === "FieldDefinition" &&
          item.attributes.tab_id === tabId &&
          item.attributes.name === "Subscribed on Former Platform",
      );

      if (fieldDefinitions && fieldDefinitions.length > 0) {
        console.log("Found existing field:", fieldDefinitions[0]);
        fieldDefinitionId = fieldDefinitions[0].id;
      }
    } else {
      // Create custom tab in Planning Center
      const pcoResponse = await fetch(
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
      console.log("Created PCO tab:", tabData);
      tabId = tabData.data.id;
    }

    // Removed the separate field fetching section since we now get fields with tabs
    if (!fieldDefinitionId) {
      // Create boolean field for "Subscribed on Former Platform"
      const booleanFieldResponse = await fetch(
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
        console.log("Created boolean field:", booleanFieldData);
        fieldDefinitionId = booleanFieldData.data.id;
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

        const fieldDatumResponse = await fetch(
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
        const createPersonResponse = await fetch(
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
        const addEmailResponse = await fetch(
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
          const fieldDatumResponse = await fetch(
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
              note: "Created but not marked as subscribed",
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
