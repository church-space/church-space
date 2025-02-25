import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@trivo/supabase/client";
import type { BlockData, BlockType } from "@/types/blocks";

interface AddEmailBlockParams {
  emailId: number;
  type: BlockType;
  value: BlockData;
  order: number;
  linkedFile?: string;
}

export function useAddEmailBlock() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      emailId,
      type,
      value,
      order,
      linkedFile,
    }: AddEmailBlockParams) => {
      // Explicitly type the insert data
      const insertData: any = {
        email_id: emailId,
        type,
        value,
        order,
      };

      if (linkedFile) {
        insertData.linked_file = linkedFile;
      }

      const { data, error } = await supabase
        .from("email_blocks")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the email query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["email", variables.emailId] });
    },
  });
}
