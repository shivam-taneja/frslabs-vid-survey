import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { Survey } from "@/types/survey";
import { createMutation } from "react-query-kit";

export const usePublishSurvey = createMutation<Survey, { surveyId: string }>({
  mutationFn: async ({ surveyId }) => {
    const res = await api.post<ApiResponse<Survey>>(
      `/api/surveys/${surveyId}/publish`,
    );

    return res.data.data!;
  },
});
