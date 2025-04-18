import { Client } from "../../types";

export async function getSentEmailStats(supabase: Client, emailId: number) {
  const [metricsResponse, linkStatsResponse] = await Promise.all([
    supabase
      .from("email_metrics")
      .select(
        `
        total_sent,
        total_opens,
        total_clicks,
        total_unsubscribes,
        total_bounces,
        total_complaints,
        updated_at
      `
      )
      .eq("email_id", emailId)
      .single(),

    supabase
      .from("email_link_click_stats")
      .select(
        `
        link_url,
        total_clicks,
        updated_at
      `
      )
      .eq("email_id", emailId),
  ]);

  if (metricsResponse.error) {
    metricsResponse.data = null;
  }

  if (linkStatsResponse.error) {
    linkStatsResponse.data = null;
  }

  return {
    metrics: metricsResponse.data,
    linkStats: linkStatsResponse.data,
  };
}
