"use server";

import type { Client, Database } from "../types";
import { getEmailWithFooterAndBlocksQuery } from "../queries/all/get-email-with-footer-and-blocks";

export async function createEmailTemplateFromEmail(
  supabase: Client,
  templateName: string,
  organizationId: string,
  sourceEmailId?: number
) {
  // If no sourceEmailId is provided, just create a basic template
  if (!sourceEmailId) {
    const { data, error } = await supabase
      .from("emails")
      .insert({
        subject: templateName,
        type: "template",
        organization_id: organizationId,
      })
      .select();

    if (error) {
      throw error;
    }

    return data;
  }

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
  const { data: directFooter, error: directFooterError } = await supabase
    .from("email_footers")
    .select("*")
    .eq("email_id", sourceEmailId)
    .maybeSingle();

  if (directFooterError) {
    console.error("Error directly querying footer:", directFooterError);
  }

  // Create the new email template
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
    try {
      // Check if a footer already exists for this email (it shouldn't, but just to be safe)

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
      } else {
        // Create a new footer linked to the new email

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

        const { error: footerError } = await supabase
          .from("email_footers")
          .insert(footerData);

        if (footerError) {
          console.error("Error creating new footer:", footerError);
          throw new Error(`Error creating new footer: ${footerError.message}`);
        }
      }
    } catch (error) {
      console.error("Error handling footer:", error);
      // Don't throw here, continue with blocks
      console.warn("Continuing without footer due to error");
    }
  }

  // Copy the blocks if they exist
  if (
    sourceEmail.email_blocks &&
    Array.isArray(sourceEmail.email_blocks) &&
    sourceEmail.email_blocks.length > 0
  ) {
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
    } catch (error) {
      console.error("Error copying blocks:", error);
      // Don't throw here, return the email even if blocks failed
      console.warn("Continuing without blocks due to error");
    }
  }

  return newEmail;
}

export async function applyEmailTemplate(
  supabase: Client,
  emailId: number,
  templateEmailId: number
) {
  // Get the template email with its footer and blocks
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
  const { error: updateStyleError } = await supabase
    .from("emails")
    .update({ style: templateEmail.style })
    .eq("id", emailId);

  if (updateStyleError) {
    console.error("Error updating email style:", updateStyleError);
    throw updateStyleError;
  }

  // Delete all existing blocks from the target email

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
    } catch (error) {
      console.error("Error copying blocks:", error);
      throw error;
    }
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
  }

  return { success: true, emailId };
}

export async function updateEmail(
  supabase: Client,
  emailId: number,
  email: Database["public"]["Tables"]["emails"]["Update"]
) {
  const { data, error } = await supabase
    .from("emails")
    .update(email)
    .eq("id", emailId)
    .select();

  if (error) {
    console.error("Error updating email:", error);
    throw error;
  }
  return { data, error };
}

export async function unsubscribeEmail(supabase: Client, emailId: number) {
  const { data, error } = await supabase
    .from("people_emails")
    .update({ status: "unsubscribed" })
    .eq("id", emailId)
    .select();

  if (error) {
    console.error("Error unsubscribing email:", error);
    throw error;
  }
  return data;
}

export async function updateEmailStatus(
  supabase: Client,
  emailId: number,
  status: "unsubscribed" | "pco_blocked" | "subscribed" | "cleaned"
) {
  const { data, error } = await supabase
    .from("people_emails")
    .update({ status: status })
    .eq("id", emailId)
    .select();

  if (error) {
    console.error("Error updating email status:", error);
    throw error;
  }
  return data;
}

export async function deleteEmailCategoryUnsubscribe(
  supabase: Client,
  emailId: number,
  categoryId: number
) {
  const { data, error } = await supabase
    .from("email_list_category_unsubscribes")
    .delete()
    .eq("unsub_email_id", emailId)
    .eq("pco_list_category", categoryId)
    .select();

  if (error) {
    console.error("Error deleting email category unsubscribe:", error);
    throw error;
  }
  return { data, error };
}

export async function createEmail(
  supabase: Client,
  email: Database["public"]["Tables"]["emails"]["Insert"],
  organizationId: string
) {
  const { data, error } = await supabase
    .from("emails")
    .insert({ ...email, organization_id: organizationId })
    .select();

  if (error) {
    console.error("Error creating email:", error);
    throw error;
  }

  // Try to get default footer, but don't throw if not found
  const { data: defaultFooter, error: defaultFooterError } = await supabase
    .from("email_org_default_footer_values")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (defaultFooterError) {
    console.error("Error fetching default footer:", defaultFooterError);
    // Continue without default footer values instead of throwing
  }

  // Create base footer object with required fields
  const footerData = {
    email_id: data[0].id,
    type: "standard" as const,
    organization_id: organizationId,
    // Only include default values if they exist
    ...(defaultFooter && {
      name: defaultFooter.name,
      subtitle: defaultFooter.subtitle,
      logo: defaultFooter.logo,
      links: defaultFooter.links,
      address: defaultFooter.address,
      reason: defaultFooter.reason,
      copyright_name: defaultFooter.copyright_name,
      socials_style: defaultFooter.socials_style,
      socials_color: defaultFooter.socials_color,
      socials_icon_color: defaultFooter.socials_icon_color,
    }),
  };

  const { data: footer, error: footerError } = await supabase
    .from("email_footers")
    .insert(footerData);

  if (footerError) {
    console.error("Error creating footer:", footerError);
    throw footerError;
  }

  return { data, error, footer };
}

export async function createEmailTemplate(
  supabase: Client,
  email: Database["public"]["Tables"]["emails"]["Insert"],
  organizationId: string
) {
  const { data, error } = await supabase
    .from("emails")
    .insert({
      ...email,
      organization_id: organizationId,
      type: "template",
    })
    .select();

  if (error) {
    console.error("Error creating email:", error);
    throw error;
  }

  const { data: footer, error: footerError } = await supabase
    .from("email_footers")
    .insert({
      email_id: data[0].id,
      type: "standard",
      organization_id: organizationId,
    });

  if (footerError) {
    console.error("Error creating footer:", footerError);
    throw footerError;
  }

  return { data, error, footer };
}

export async function deleteEmail(supabase: Client, emailId: number) {
  const { data, error } = await supabase
    .from("emails")
    .delete()
    .eq("id", emailId)
    .select();

  if (error) {
    console.error("Error deleting email:", error);
    throw error;
  }
  return { data, error };
}

export async function updateDefaultEmailFooter(
  supabase: Client,
  organizationId: string,
  footer: Database["public"]["Tables"]["email_org_default_footer_values"]["Update"]
) {
  const { data, error } = await supabase
    .from("email_org_default_footer_values")
    .upsert(
      {
        ...footer,
        organization_id: organizationId,
      },
      {
        onConflict: "organization_id",
      }
    )
    .select();

  if (error) {
    console.error("Error updating default email footer:", error);
    throw error;
  }
  return { data, error };
}

export async function updateEmailCategory(
  supabase: Client,
  emailCategoryId: number,
  emailCategory: Database["public"]["Tables"]["email_categories"]["Update"]
) {
  const { data, error } = await supabase
    .from("email_categories")
    .update(emailCategory)
    .eq("id", emailCategoryId)
    .select();

  if (error) {
    console.error("Error updating email category:", error);
    throw error;
  }
  return { data, error };
}

export async function deleteEmailCategory(
  supabase: Client,
  emailCategoryId: number
) {
  const { data, error } = await supabase
    .from("email_categories")
    .delete()
    .eq("id", emailCategoryId)
    .select();

  if (error) {
    console.error("Error deleting email category:", error);
    throw error;
  }
  return { data, error };
}

export async function createEmailCategory(
  supabase: Client,
  emailCategory: Database["public"]["Tables"]["email_categories"]["Insert"]
) {
  const { data, error } = await supabase
    .from("email_categories")
    .insert(emailCategory)
    .select();

  if (error) {
    console.error("Error creating email category:", error);
    throw error;
  }
  return { data, error };
}
