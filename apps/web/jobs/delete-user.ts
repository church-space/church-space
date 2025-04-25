import "server-only";

import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";

export const deleteUser = task({
  id: "delete-user",

  run: async (payload: { user_id: string }, io) => {
    const supabase = createClient();

    const { data, error } = await supabase.auth.admin.deleteUser(
      payload.user_id,
    );

    if (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }

    return {
      success: true,
      message: `User ${payload.user_id} successfully deleted`,
    };
  },
});
