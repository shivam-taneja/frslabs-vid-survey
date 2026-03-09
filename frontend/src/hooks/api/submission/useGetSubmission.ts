import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { Submission } from "@/types/submission";
import { createQuery } from "react-query-kit";

export const useGetSubmission = createQuery<
  Submission,
  { submissionId: string }
>({
  queryKey: ["submission"],
  fetcher: async ({ submissionId }) => {
    const res = await api.get<ApiResponse<Submission>>(
      `/api/submissions/${submissionId}`,
    );

    return res.data.data!;
  },
});
