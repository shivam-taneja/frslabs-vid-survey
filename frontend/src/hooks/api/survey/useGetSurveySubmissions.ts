import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { Submission } from "@/types/submission";
import { createQuery } from "react-query-kit";

export const useGetSurveySubmissions = createQuery<
  Submission[],
  { surveyId: string }
>({
  queryKey: ["survey-submissions"],
  fetcher: async ({ surveyId }) => {
    const res = await api.get<ApiResponse<Submission[]>>(
      `/api/surveys/${surveyId}/submissions`,
    );

    return res.data.data!;
  },
});
