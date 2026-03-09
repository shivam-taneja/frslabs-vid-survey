import api from "@/lib/api";
import { CreateSurveyPayload } from "@/lib/validations/survey";
import { ApiResponse } from "@/types/api-response";
import { Survey } from "@/types/survey";
import { createMutation } from "react-query-kit";

export const useCreateSurvey = createMutation<Survey, CreateSurveyPayload>({
  mutationFn: async (payload) => {
    const res = await api.post<ApiResponse<Survey>>("/api/surveys", payload);

    return res.data.data!;
  },
});
