import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { Submission } from "@/types/submission";
import { createMutation } from "react-query-kit";

export const useStartSubmission = createMutation<
  Submission,
  { surveyId: string }
>({
  mutationFn: async ({ surveyId }) => {
    const res = await api.post<ApiResponse<Submission>>(
      `/api/surveys/${surveyId}/start`,
    );

    return res.data.data!;
  },
});
