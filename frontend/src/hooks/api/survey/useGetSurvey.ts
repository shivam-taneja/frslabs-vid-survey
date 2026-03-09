import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { SurveyWithQuestions } from "@/types/survey";
import { createQuery } from "react-query-kit";

export const useGetSurvey = createQuery<
  SurveyWithQuestions,
  { surveyId: string }
>({
  queryKey: ["survey"],
  fetcher: async ({ surveyId }) => {
    const res = await api.get<ApiResponse<SurveyWithQuestions>>(
      `/api/surveys/${surveyId}`,
    );

    return res.data.data!;
  },
});
