import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { Answer } from "@/types/submission";
import { createQuery } from "react-query-kit";

export const useGetSubmissionAnswers = createQuery<
  Answer[],
  { submissionId: string }
>({
  queryKey: ["submission-answers"],
  fetcher: async ({ submissionId }) => {
    const res = await api.get<ApiResponse<Answer[]>>(
      `/api/submissions/${submissionId}/answers`,
    );

    return res.data.data!;
  },
});
