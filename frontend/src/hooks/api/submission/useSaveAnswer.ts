import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { SaveAnswersPayload } from "@/types/submission";
import { createMutation } from "react-query-kit";

export const useSaveAnswer = createMutation<void, SaveAnswersPayload>({
  mutationFn: async ({ submissionId, answers }) => {
    await api.post<ApiResponse<null>>(
      `/api/submissions/${submissionId}/answers`,
      { answers },
    );
  },
});
