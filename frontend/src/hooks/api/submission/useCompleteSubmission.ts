import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { CompletedSubmission } from "@/types/submission";
import { createMutation } from "react-query-kit";

export const useCompleteSubmission = createMutation<
  CompletedSubmission,
  { submissionId: string }
>({
  mutationFn: async ({ submissionId }) => {
    const res = await api.post<ApiResponse<CompletedSubmission>>(
      `/api/submissions/${submissionId}/complete`,
    );

    return res.data.data!;
  },
});
