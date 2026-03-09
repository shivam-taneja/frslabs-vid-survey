import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { Survey } from "@/types/survey";
import { createMutation } from "react-query-kit";

export const useUpdateSurvey = createMutation<
  Survey,
  { surveyId: string; payload: Partial<Survey> }
>({
  mutationFn: async ({ surveyId, payload }) => {
    const res = await api.patch<ApiResponse<Survey>>(
      `/api/surveys/${surveyId}`,
      payload,
    );

    return res.data.data!;
  },
});
