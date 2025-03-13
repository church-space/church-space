import type { Client, Database } from "../types";
import { getEmailWithFooterAndBlocksQuery } from "../queries/all/get-email-with-footer-and-blocks";

export async function createEmailTemplate(
  supabase: Client,
  templateName: string,
  organizationId: string,
  sourceEmailId?: number
) {
  console.log("createEmailTemplate called with:", {
    templateName,
    organizationId,
    sourceEmailId,
  });

  // If no sourceEmailId is provided, just create a basic template
  if (!sourceEmailId) {
    console.log("No sourceEmailId provided, creating basic template");
    const { data, error } = await supabase
      .from("emails")
      .insert({
        subject: templateName,
        type: "template",
        organization_id: organizationId,
      })
      .select();

    if (error) {
      console.error("Error creating basic template:", error);
      throw error;
    }

    return data;
  }

  // Get the source email with its footer and blocks
  console.log("Fetching source email with ID:", sourceEmailId);
  const { data: sourceEmail, error: sourceError } =
    await getEmailWithFooterAndBlocksQuery(supabase, sourceEmailId);

  if (sourceError) {
    console.error("Error fetching source email:", sourceError);
    throw sourceError;
  }

  if (!sourceEmail) {
    console.error("Source email not found");
    throw new Error("Source email not found");
  }

  // Directly query for the footer to ensure we have it
  console.log("Directly querying for footer with email_id:", sourceEmailId);
  const { data: directFooter, error: directFooterError } = await supabase
    .from("email_footers")
    .select("*")
    .eq("email_id", sourceEmailId)
    .maybeSingle();

  if (directFooterError) {
    console.error("Error directly querying footer:", directFooterError);
  } else {
    console.log("Direct footer query result:", directFooter);
  }

  console.log("Source email found:", {
    id: sourceEmail.id,
    subject: sourceEmail.subject,
    hasFooter:
      sourceEmail.email_footers &&
      Array.isArray(sourceEmail.email_footers) &&
      sourceEmail.email_footers.length > 0,
    footerData: sourceEmail.email_footers,
    hasBlocks:
      sourceEmail.email_blocks &&
      Array.isArray(sourceEmail.email_blocks) &&
      sourceEmail.email_blocks.length > 0,
  });

  // Create the new email template
  console.log("Creating new email template");
  const { data: newEmail, error: emailError } = await supabase
    .from("emails")
    .insert({
      subject: templateName,
      type: "template",
      organization_id: organizationId,
      style: sourceEmail.style,
    })
    .select()
    .single();

  if (emailError) {
    console.error("Error creating email template:", emailError);
    throw emailError;
  }

  console.log("New email template created:", newEmail);

  // Use the direct footer query result if available, otherwise use the one from the email
  const sourceFooter =
    directFooter ||
    (sourceEmail.email_footers &&
    Array.isArray(sourceEmail.email_footers) &&
    sourceEmail.email_footers.length > 0
      ? sourceEmail.email_footers[0]
      : null);

  // Copy the footer if it exists
  if (sourceFooter) {
    console.log("Source footer found:", {
      id: sourceFooter.id,
      type: sourceFooter.type,
    });

    try {
      // Check if a footer already exists for this email (it shouldn't, but just to be safe)
      console.log("Checking for existing footer for email ID:", newEmail.id);
      const { data: existingFooter, error: checkError } = await supabase
        .from("email_footers")
        .select("id")
        .eq("email_id", newEmail.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking for existing footer:", checkError);
        throw new Error(
          `Error checking for existing footer: ${checkError.message}`
        );
      }

      // If a footer already exists, update it instead of creating a new one
      if (existingFooter) {
        console.log("Existing footer found, updating:", existingFooter);
        const { error: updateError } = await supabase
          .from("email_footers")
          .update({
            type: sourceFooter.type,
            name: sourceFooter.name,
            subtitle: sourceFooter.subtitle,
            logo: sourceFooter.logo,
            links: sourceFooter.links,
            bg_color: sourceFooter.bg_color,
            text_color: sourceFooter.text_color,
            organization_id: organizationId,
            template_title: sourceFooter.template_title,
            address: sourceFooter.address,
            reason: sourceFooter.reason,
            copyright_name: sourceFooter.copyright_name,
            socials_style: sourceFooter.socials_style,
            socials_color: sourceFooter.socials_color,
            socials_icon_color: sourceFooter.socials_icon_color,
            secondary_text_color: sourceFooter.secondary_text_color,
          })
          .eq("id", existingFooter.id);

        if (updateError) {
          console.error("Error updating existing footer:", updateError);
          throw new Error(
            `Error updating existing footer: ${updateError.message}`
          );
        }
        console.log("Footer updated successfully");
      } else {
        // Create a new footer linked to the new email
        console.log("Creating new footer for email ID:", newEmail.id);

        // Create a clean footer object without any unexpected properties
        const footerData = {
          // Ensure type is a valid enum value
          type:
            sourceFooter.type === "standard" || sourceFooter.type === "template"
              ? sourceFooter.type
              : "standard", // Default to "standard" if invalid
          name: sourceFooter.name,
          subtitle: sourceFooter.subtitle,
          logo: sourceFooter.logo,
          links: sourceFooter.links,
          bg_color: sourceFooter.bg_color,
          text_color: sourceFooter.text_color,
          organization_id: organizationId,
          template_title: sourceFooter.template_title,
          address: sourceFooter.address,
          reason: sourceFooter.reason,
          copyright_name: sourceFooter.copyright_name,
          email_id: newEmail.id,
          // Ensure socials_style is a valid enum value
          socials_style:
            sourceFooter.socials_style === "filled" ||
            sourceFooter.socials_style === "outline"
              ? sourceFooter.socials_style
              : "filled", // Default to "filled" if invalid or missing
          socials_color: sourceFooter.socials_color,
          socials_icon_color: sourceFooter.socials_icon_color,
          secondary_text_color: sourceFooter.secondary_text_color,
        };

        console.log("Footer data to insert:", footerData);

        const { error: footerError } = await supabase
          .from("email_footers")
          .insert(footerData);

        if (footerError) {
          console.error("Error creating new footer:", footerError);
          throw new Error(`Error creating new footer: ${footerError.message}`);
        }
        console.log("Footer created successfully");
      }
    } catch (error) {
      console.error("Error handling footer:", error);
      // Don't throw here, continue with blocks
      console.warn("Continuing without footer due to error");
    }
  } else {
    console.log("No footer found in source email, skipping footer creation");
  }

  // Copy the blocks if they exist
  if (
    sourceEmail.email_blocks &&
    Array.isArray(sourceEmail.email_blocks) &&
    sourceEmail.email_blocks.length > 0
  ) {
    console.log("Copying blocks, count:", sourceEmail.email_blocks.length);
    try {
      const blocksToInsert = sourceEmail.email_blocks.map((block) => ({
        type: block.type,
        value: block.value,
        email_id: newEmail.id,
        linked_file: block.linked_file,
        order: block.order,
      }));

      const { error: blocksError } = await supabase
        .from("email_blocks")
        .insert(blocksToInsert);

      if (blocksError) {
        console.error("Error inserting blocks:", blocksError);
        throw new Error(`Error inserting blocks: ${blocksError.message}`);
      }
      console.log("Blocks copied successfully");
    } catch (error) {
      console.error("Error copying blocks:", error);
      // Don't throw here, return the email even if blocks failed
      console.warn("Continuing without blocks due to error");
    }
  } else {
    console.log("No blocks found in source email, skipping block creation");
  }

  console.log("Template creation completed successfully");
  return newEmail;
}

export async function applyEmailTemplate(
  supabase: Client,
  emailId: number,
  templateEmailId: number
) {
  console.log("applyEmailTemplate called with:", {
    emailId,
    templateEmailId,
  });

  // Get the template email with its footer and blocks
  console.log("Fetching template email with ID:", templateEmailId);
  const { data: templateEmail, error: templateError } =
    await getEmailWithFooterAndBlocksQuery(supabase, templateEmailId);

  if (templateError) {
    console.error("Error fetching template email:", templateError);
    throw templateError;
  }

  if (!templateEmail) {
    console.error("Template email not found");
    throw new Error("Template email not found");
  }

  // Get the target email to update
  console.log("Fetching target email with ID:", emailId);
  const { data: targetEmail, error: targetError } = await supabase
    .from("emails")
    .select("*")
    .eq("id", emailId)
    .single();

  if (targetError) {
    console.error("Error fetching target email:", targetError);
    throw targetError;
  }

  // Update the target email style to match the template
  console.log("Updating target email style");
  const { error: updateStyleError } = await supabase
    .from("emails")
    .update({ style: templateEmail.style })
    .eq("id", emailId);

  if (updateStyleError) {
    console.error("Error updating email style:", updateStyleError);
    throw updateStyleError;
  }

  // Delete all existing blocks from the target email
  console.log("Deleting existing blocks from target email");
  const { error: deleteBlocksError } = await supabase
    .from("email_blocks")
    .delete()
    .eq("email_id", emailId);

  if (deleteBlocksError) {
    console.error("Error deleting existing blocks:", deleteBlocksError);
    throw deleteBlocksError;
  }

  // Copy the template blocks to the target email
  if (
    templateEmail.email_blocks &&
    Array.isArray(templateEmail.email_blocks) &&
    templateEmail.email_blocks.length > 0
  ) {
    console.log("Copying blocks, count:", templateEmail.email_blocks.length);
    try {
      const blocksToInsert = templateEmail.email_blocks.map((block) => ({
        type: block.type,
        value: block.value,
        email_id: emailId,
        linked_file: block.linked_file,
        order: block.order,
      }));

      const { error: blocksError } = await supabase
        .from("email_blocks")
        .insert(blocksToInsert);

      if (blocksError) {
        console.error("Error inserting blocks:", blocksError);
        throw new Error(`Error inserting blocks: ${blocksError.message}`);
      }
      console.log("Blocks copied successfully");
    } catch (error) {
      console.error("Error copying blocks:", error);
      throw error;
    }
  } else {
    console.log("No blocks found in template email");
  }

  // Handle the footer
  // First, check if the template has a footer
  const templateFooter =
    templateEmail.email_footers &&
    Array.isArray(templateEmail.email_footers) &&
    templateEmail.email_footers.length > 0
      ? templateEmail.email_footers[0]
      : null;

  if (templateFooter) {
    console.log("Template footer found, updating target email footer");

    // Check if the target email already has a footer
    const { data: existingFooter, error: checkFooterError } = await supabase
      .from("email_footers")
      .select("id")
      .eq("email_id", emailId)
      .maybeSingle();

    if (checkFooterError) {
      console.error("Error checking for existing footer:", checkFooterError);
      throw checkFooterError;
    }

    // Prepare footer data without id and created_at
    const footerData = {
      type: templateFooter.type,
      name: templateFooter.name,
      subtitle: templateFooter.subtitle,
      logo: templateFooter.logo,
      links: templateFooter.links,
      bg_color: templateFooter.bg_color,
      text_color: templateFooter.text_color,
      organization_id: targetEmail.organization_id,
      template_title: templateFooter.template_title,
      address: templateFooter.address,
      reason: templateFooter.reason,
      copyright_name: templateFooter.copyright_name,
      socials_style: templateFooter.socials_style,
      socials_color: templateFooter.socials_color,
      socials_icon_color: templateFooter.socials_icon_color,
      secondary_text_color: templateFooter.secondary_text_color,
    };

    if (existingFooter) {
      // Update existing footer
      console.log("Updating existing footer");
      const { error: updateFooterError } = await supabase
        .from("email_footers")
        .update(footerData)
        .eq("id", existingFooter.id);

      if (updateFooterError) {
        console.error("Error updating footer:", updateFooterError);
        throw updateFooterError;
      }
    } else {
      // Create new footer
      console.log("Creating new footer");
      const { error: createFooterError } = await supabase
        .from("email_footers")
        .insert({
          ...footerData,
          email_id: emailId,
        });

      if (createFooterError) {
        console.error("Error creating footer:", createFooterError);
        throw createFooterError;
      }
    }
    console.log("Footer updated successfully");
  } else {
    console.log("No footer found in template email");
  }

  console.log("Template application completed successfully");
  return { success: true, emailId };
}
