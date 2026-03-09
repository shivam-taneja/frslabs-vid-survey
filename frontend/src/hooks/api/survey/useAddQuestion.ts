import api from "@/lib/api";
import { AddQuestionsPayload } from "@/lib/validations/survey";
import { ApiResponse } from "@/types/api-response";
import { SurveyQuestion } from "@/types/survey";
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
