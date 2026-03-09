import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { createMutation } from "react-query-kit";

export const useDeleteSurvey = createMutation<boolean, { surveyId: string }>({
  mutationFn: async ({ surveyId }) => {
    const res = await api.delete<ApiResponse<boolean>>(
      `/api/surveys/${surveyId}`,
    );

    return res.data.data!;
  },
});
