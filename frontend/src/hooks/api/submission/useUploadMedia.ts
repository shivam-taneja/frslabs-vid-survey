import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { UploadMediaPayload } from "@/types/submission";
import { createMutation } from "react-query-kit";

export const useUploadMedia = createMutation<
  void,
  UploadMediaPayload & { signal?: AbortSignal }
>({
  mutationFn: async ({ submissionId, questionId, type, file, signal }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("question_id", questionId);

    await api.post<ApiResponse<null>>(
      `/api/submissions/${submissionId}/media`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal,
      },
    );
  },
});
