import { Client } from "../../types";

export async function getSentEmailStats(supabase: Client, emailId: number) {
  console.log("emailId", emailId);

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
    console.log("Metrics response error:", metricsResponse.error);
    metricsResponse.data = null;
  }

  if (linkStatsResponse.error) {
    console.log("Link stats response error:", linkStatsResponse.error);
    linkStatsResponse.data = null;
  }

  console.log("Metrics data:", metricsResponse.data);
  console.log("Link stats data:", linkStatsResponse.data);
  return {
    metrics: metricsResponse.data,
    linkStats: linkStatsResponse.data,
  };
}
