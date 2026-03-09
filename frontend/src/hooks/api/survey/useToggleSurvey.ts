import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { Survey } from "@/types/survey";
import { createMutation } from "react-query-kit";

export const useToggleSurvey = createMutation<Survey, { surveyId: string }>({
  mutationFn: async ({ surveyId }) => {
    const res = await api.patch<ApiResponse<Survey>>(
      `/api/surveys/${surveyId}/toggle`,
    );

    return res.data.data!;
  },
});
