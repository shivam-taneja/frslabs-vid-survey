import api from "@/lib/api";
import { SaveAnswersPayload } from "@/lib/validations/submission";
import { ApiResponse } from "@/types/api-response";
import { createMutation } from "react-query-kit";

export const useSaveAnswer = createMutation<void, SaveAnswersPayload>({
  mutationFn: async ({ submissionId, answers }) => {
    await api.post<ApiResponse<null>>(
      `/api/submissions/${submissionId}/answers`,
      { answers },
    );
  },
});
