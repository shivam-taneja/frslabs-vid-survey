import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { AddQuestionsPayload, SurveyQuestion } from "@/types/survey";
import { createMutation } from "react-query-kit";

export const useAddQuestion = createMutation<
  SurveyQuestion[],
  AddQuestionsPayload
>({
  mutationFn: async ({ surveyId, questions }) => {
    const res = await api.post<ApiResponse<SurveyQuestion[]>>(
      `/api/surveys/${surveyId}/questions`,
      { questions },
    );

    return res.data.data!;
  },
});
